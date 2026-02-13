#region using

using Catalog.Domain.Entities;

#endregion

namespace Catalog.Application.Repositories;

/// <summary>
/// Interface quản lý Outbox Pattern - đảm bảo việc gửi message/event đến hệ thống bên ngoài
/// (RabbitMQ, Kafka) một cách đáng tin cậy và transactional.
/// </summary>
public interface IOutboxRepository
{
    #region Methods

    /// <summary>
    /// Thêm một message mới vào bảng Outbox trong database.
    /// Dùng khi có domain event xảy ra (ví dụ: tạo sản phẩm mới).
    /// Message được lưu cùng transaction với business logic → không bị mất message.
    /// </summary>
    /// <param name="message">Message cần lưu vào Outbox</param>
    /// <param name="cancellationToken">Token để hủy thao tác</param>
    /// <returns>True nếu thêm thành công, False nếu thất bại</returns>
    Task<bool> AddMessageAsync(OutboxMessageEntity message, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cập nhật trạng thái của nhiều message cùng lúc.
    /// Dùng sau khi publish thành công (đánh dấu Completed) hoặc thất bại (tăng RetryCount).
    /// </summary>
    /// <param name="messages">Danh sách message cần cập nhật</param>
    /// <param name="cancellationToken">Token để hủy thao tác</param>
    /// <returns>True nếu cập nhật thành công, False nếu thất bại</returns>
    Task<bool> UpdateMessagesAsync(IEnumerable<OutboxMessageEntity> messages, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy và "claim" (đánh dấu đang xử lý) một batch message chưa được xử lý.
    /// Worker service gọi method này để lấy message cần publish.
    /// Claim giúp tránh các worker khác cùng xử lý trùng message (tránh duplicate).
    /// </summary>
    /// <param name="batchSize">Số lượng message tối đa cần lấy</param>
    /// <param name="cancellationToken">Token để hủy thao tác</param>
    /// <returns>Danh sách message đã được claim</returns>
    Task<List<OutboxMessageEntity>> GetAndClaimMessagesAsync(int batchSize, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy và claim các message cần retry (đã thất bại trước đó).
    /// Lấy các message có Status = Failed và RetryCount chưa vượt giới hạn.
    /// Cho phép xử lý lại các message bị lỗi tạm thời (network timeout, broker down).
    /// </summary>
    /// <param name="batchSize">Số lượng message tối đa cần lấy</param>
    /// <param name="cancellationToken">Token để hủy thao tác</param>
    /// <returns>Danh sách message cần retry đã được claim</returns>
    Task<List<OutboxMessageEntity>> GetAndClaimRetryMessagesAsync(int batchSize, CancellationToken cancellationToken = default);

    /// <summary>
    /// Giải phóng claim cho các message sau khi xử lý xong (thành công hoặc thất bại).
    /// Xóa ClaimedAt, ClaimedBy để message có thể được claim lại nếu cần.
    /// </summary>
    /// <param name="messages">Danh sách message cần giải phóng claim</param>
    /// <param name="cancellationToken">Token để hủy thao tác</param>
    /// <returns>True nếu giải phóng thành công, False nếu thất bại</returns>
    Task<bool> ReleaseClaimsAsync(IEnumerable<OutboxMessageEntity> messages, CancellationToken cancellationToken = default);

    /// <summary>
    /// Giải phóng các claim đã hết hạn (expired).
    /// Nếu worker claim message nhưng bị crash/timeout → message đó sẽ bị "kẹt".
    /// Method này tìm các message có ClaimedAt vượt claimTimeout và giải phóng chúng.
    /// Đảm bảo không có message nào bị bỏ sót.
    /// </summary>
    /// <param name="claimTimeout">Thời gian tối đa cho phép claim (quá thời gian này sẽ bị giải phóng)</param>
    /// <param name="cancellationToken">Token để hủy thao tác</param>
    /// <returns>True nếu giải phóng thành công, False nếu thất bại</returns>
    Task<bool> ReleaseExpiredClaimsAsync(TimeSpan claimTimeout, CancellationToken cancellationToken = default);

    #endregion
}

