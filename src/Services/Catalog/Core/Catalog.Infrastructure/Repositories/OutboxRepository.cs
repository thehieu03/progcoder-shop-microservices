#region using

using Catalog.Application.Repositories;
using Catalog.Domain.Entities;
using Marten;
using Microsoft.Extensions.Logging;

#endregion

namespace Catalog.Infrastructure.Repositories;

/// <summary>
/// Repository xử lý Outbox Pattern cho Catalog Service.
/// Sử dụng Marten (PostgreSQL Document DB) để lưu trữ và quản lý các outbox message.
/// </summary>
/// <param name="session">Marten Document Session để thao tác với database</param>
/// <param name="logger">Logger để ghi log các hoạt động</param>
public class OutboxRepository(IDocumentSession session, ILogger<OutboxRepository> logger) : IOutboxRepository
{
    #region Implementations

    /// <summary>
    /// Thêm một message mới vào Outbox table.
    /// </summary>
    public async Task<bool> AddMessageAsync(OutboxMessageEntity message, CancellationToken cancellationToken = default)
    {
        // Ghi log debug trước khi thêm message
        logger.LogDebug("Adding outbox message {MessageId} of type {EventType}", message.Id, message.EventType);

        // Lưu message vào Marten session (chưa commit vào DB)
        session.Store(message);
        // Commit tất cả thay đổi vào database
        await session.SaveChangesAsync(cancellationToken);

        // Ghi log thành công
        logger.LogInformation("Successfully added outbox message {MessageId} of type {EventType}", message.Id, message.EventType);
        return true;
    }

    /// <summary>
    /// Cập nhật trạng thái của nhiều message (sau khi publish thành công/thất bại).
    /// </summary>
    public async Task<bool> UpdateMessagesAsync(IEnumerable<OutboxMessageEntity> messages, CancellationToken cancellationToken = default)
    {
        // Chuyển IEnumerable thành List để đếm số lượng và duyệt nhiều lần
        var messageList = messages.ToList();
        logger.LogDebug("Updating {Count} outbox messages", messageList.Count);

        // Lưu từng message vào session
        foreach (var message in messageList)
        {
            session.Store(message);
        }
        // Commit tất cả thay đổi vào database trong 1 transaction
        await session.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Successfully updated {Count} outbox messages", messageList.Count);
        return true;
    }

    /// <summary>
    /// Lấy và claim các message chưa được xử lý.
    /// Claim = đánh dấu đang xử lý để tránh các worker khác xử lý trùng.
    /// </summary>
    public async Task<List<OutboxMessageEntity>> GetAndClaimMessagesAsync(int batchSize, CancellationToken cancellationToken = default)
    {
        // Lấy thời gian hiện tại (UTC) để đánh dấu claim
        var now = DateTimeOffset.UtcNow;
        
        // Claim timeout = thời gian tối đa một worker được phép giữ claim (5 phút)
        // Sau thời gian này, claim được coi là "expired" và message có thể được claim lại
        var claimTimeout = TimeSpan.FromMinutes(5);
        
        // Tính thời điểm mà claim cũ hơn sẽ bị coi là expired
        // Ví dụ: now = 10:00, claimTimeout = 5 phút → expiredTime = 09:55
        var expiredTime = now.Subtract(claimTimeout);

        logger.LogDebug("Attempting to claim up to {BatchSize} unprocessed outbox messages", batchSize);
        try
        {
            // Truy vấn các message thỏa mãn điều kiện:
            // 1. Chưa được xử lý (ProcessedOnUtc == null)
            // 2. Chưa bị claim HOẶC claim đã hết hạn (ClaimedOnUtc < expiredTime)
            var messagesToClaim = await session.Query<OutboxMessageEntity>()
                .Where(x => x.ProcessedOnUtc == null
                    && (x.ClaimedOnUtc == null || x.ClaimedOnUtc < expiredTime))
                .OrderBy(x => x.OccurredOnUtc) // Xử lý theo thứ tự thời gian xảy ra
                .Take(batchSize)               // Giới hạn số lượng lấy ra
                .ToListAsync(cancellationToken);

            // Nếu không có message nào cần xử lý
            if (!messagesToClaim.Any())
            {
                await session.SaveChangesAsync(cancellationToken);
                logger.LogDebug("No unprocessed messages found to claim");
                return [];
            }

            // Đánh dấu claim cho từng message
            // Claim = set ClaimedOnUtc = now để các worker khác biết message đang được xử lý
            foreach (var message in messagesToClaim)
            {
                message.Claim(now);    // Gọi method Claim() của entity
                session.Store(message); // Lưu thay đổi vào session
            }

            // Commit tất cả claim vào database
            await session.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Successfully claimed {Count} outbox messages", messagesToClaim.Count);
            return messagesToClaim.ToList();
        }
        catch (Exception ex)
        {
            // Ghi log lỗi và trả về list rỗng nếu có exception
            logger.LogError(ex, "Error occurred while claiming outbox messages");
            return [];
        }
    }

    /// <summary>
    /// Lấy và claim các message cần retry (đã thất bại trước đó nhưng chưa vượt max attempts).
    /// </summary>
    public async Task<List<OutboxMessageEntity>> GetAndClaimRetryMessagesAsync(int batchSize, CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var claimTimeout = TimeSpan.FromMinutes(5);
        var expiredTime = now.Subtract(claimTimeout);

        logger.LogDebug("Attempting to claim up to {BatchSize} retry outbox messages", batchSize);

        try
        {
            // Truy vấn các message cần retry với điều kiện:
            // 1. Chưa được xử lý thành công (ProcessedOnUtc == null)
            // 2. Số lần thử chưa vượt quá giới hạn (AttemptCount < MaxAttempts)
            // 3. Đã đến thời điểm retry (NextAttemptOnUtc <= now) hoặc chưa set
            // 4. Chưa bị claim hoặc claim đã hết hạn
            var allRetryMessages = await session.Query<OutboxMessageEntity>()
                .Where(x => x.ProcessedOnUtc == null
                    && x.AttemptCount < x.MaxAttempts
                    && (x.NextAttemptOnUtc == null || x.NextAttemptOnUtc <= now)
                    && (x.ClaimedOnUtc == null || x.ClaimedOnUtc < expiredTime))
                .OrderBy(x => x.OccurredOnUtc)
                .Take(batchSize * 2) // Lấy gấp đôi để có đủ sau khi sort lại
                .ToListAsync(cancellationToken);

            // Sort lại theo NextAttemptOnUtc để ưu tiên message chờ retry lâu nhất
            // Nếu NextAttemptOnUtc null thì dùng OccurredOnUtc làm fallback
            var retryMessages = allRetryMessages
                .OrderBy(x => x.NextAttemptOnUtc ?? x.OccurredOnUtc)
                .ThenBy(x => x.OccurredOnUtc)
                .Take(batchSize)
                .ToList();

            if (!retryMessages.Any())
            {
                await session.SaveChangesAsync(cancellationToken);
                logger.LogDebug("No retry messages found to claim");
                return [];
            }

            // Đánh dấu claim cho các message retry
            foreach (var message in retryMessages)
            {
                message.Claim(now);
                session.Store(message);
            }

            await session.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Successfully claimed {Count} retry outbox messages", retryMessages.Count);
            return retryMessages.ToList();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while claiming retry outbox messages");
            return [];
        }
    }

    /// <summary>
    /// Giải phóng các claim đã hết hạn (worker crash hoặc timeout).
    /// Đảm bảo không có message nào bị "kẹt" mãi mãi.
    /// </summary>
    public async Task<bool> ReleaseExpiredClaimsAsync(TimeSpan claimTimeout, CancellationToken cancellationToken = default)
    {
        // Tính thời điểm hết hạn: claim cũ hơn thời điểm này sẽ bị giải phóng
        var expiredTime = DateTimeOffset.UtcNow.Subtract(claimTimeout);

        logger.LogDebug("Releasing expired claims older than {ExpiredTime}", expiredTime);

        // Tìm các message có claim đã hết hạn
        // Điều kiện: chưa xử lý, đã bị claim, và claim time < expiredTime
        var expiredMessages = await session.Query<OutboxMessageEntity>()
            .Where(x => x.ProcessedOnUtc == null
                && x.ClaimedOnUtc != null
                && x.ClaimedOnUtc < expiredTime)
            .ToListAsync(cancellationToken);

        if (!expiredMessages.Any())
        {
            logger.LogDebug("No expired claims found to release");
            return true;
        }

        // Xóa claim bằng cách set ClaimedOnUtc = null
        // Message sẽ có thể được claim lại bởi worker khác
        foreach (var message in expiredMessages)
        {
            message.ClaimedOnUtc = null;
            session.Store(message);
        }

        await session.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Successfully released {Count} expired claims", expiredMessages.Count);
        return true;
    }

    /// <summary>
    /// Giải phóng claim cho các message sau khi xử lý xong.
    /// Dùng khi worker hoàn thành xử lý (thành công hoặc thất bại).
    /// </summary>
    public async Task<bool> ReleaseClaimsAsync(IEnumerable<OutboxMessageEntity> messages, CancellationToken cancellationToken = default)
    {
        var messageList = messages.ToList();
        logger.LogDebug("Releasing claims for {Count} outbox messages", messageList.Count);

        // Xóa claim cho từng message
        foreach (var message in messageList)
        {
            message.ClaimedOnUtc = null;
            session.Store(message);
        }

        await session.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Successfully released claims for {Count} outbox messages", messageList.Count);
        return true;
    }

    #endregion
}

