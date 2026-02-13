#region using

using System.Text.Json;
using Catalog.Application.Services;
using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;

#endregion

namespace Catalog.Infrastructure.Services;

public sealed class MinIOCloudService : IMinIOCloudService
{
    private readonly IMinioClient _minioClient;
    private readonly string _endPoint;
    public MinIOCloudService(IMinioClient minioClient)
    {
        _minioClient = minioClient;
        _endPoint = _minioClient.Config.Endpoint;
    }
    public async Task<List<UploadFileResult>> UploadFilesAsync(
        List<UploadFileBytes> files,
        string bucketName,
        bool isPublicBucket = false,
        CancellationToken ct = default)
    {
        var results = new List<UploadFileResult>();
        if (files == null || files.Count == 0) return results;

        try
        {
            // Bước 1: Đảm bảo bucket tồn tại trước khi upload (tự động tạo nếu chưa có)
            await EnsureBucketAsync(bucketName, isPublicBucket, ct);

            // Bước 2: Duyệt qua từng file trong danh sách để upload lên MinIO
            foreach (var f in files)
            {
                // Tạo ID duy nhất cho file trên cloud (dùng GUID để tránh trùng tên)
                var fileCloudId = Guid.NewGuid();
                
                // Lấy phần mở rộng của file gốc (ví dụ: .jpg, .png, .pdf)
                var ext = Path.GetExtension(f.FileName);
                
                // Tạo tên file mới trên cloud: GUID + extension
                // Format "N" = GUID không có dấu gạch ngang (32 ký tự liền)
                // Ví dụ: "a1b2c3d4e5f6...xyz.jpg"
                var objectName = $"{fileCloudId:N}{ext}";
                
                // Chuyển byte array thành MemoryStream để upload
                // - writable: false = stream chỉ đọc (không cho phép ghi thêm)
                // - publiclyVisible: true = cho phép truy cập buffer nội bộ
                using var stream = new MemoryStream(f.Bytes, 0, f.Bytes.Length, writable: false, publiclyVisible: true);
                
                // Cấu hình các tham số để upload file lên MinIO
                var putArgs = new PutObjectArgs()
                    .WithBucket(bucketName)        // Tên bucket chứa file
                    .WithObject(objectName)        // Tên file trên cloud
                    .WithStreamData(stream)        // Dữ liệu file dạng stream
                    .WithObjectSize(stream.Length) // Kích thước file (bytes)
                    .WithContentType(f.ContentType); // Loại MIME (image/jpeg, application/pdf, ...)

                // Thực hiện upload file lên MinIO
                var putResp = await _minioClient.PutObjectAsync(putArgs, ct);

                // Bước 3: Lưu kết quả upload vào danh sách trả về
                results.Add(new UploadFileResult
                {
                    FileId = fileCloudId.ToString(),      // ID file trên cloud
                    FolderName = bucketName,              // Tên bucket chứa file
                    OriginalFileName = f.FileName,        // Tên file gốc từ client
                    FileName = objectName,                // Tên file mới trên cloud
                    FileSize = f.Bytes.LongLength,        // Kích thước file (bytes)
                    ContentType = f.ContentType,          // Loại MIME của file
                    // URL công khai (chỉ có nếu bucket là public)
                    // Ví dụ: "http://localhost:9000/images/abc123.jpg"
                    PublicURL = isPublicBucket ? $"{_endPoint}/{bucketName}/{objectName}" : string.Empty,
                });
            }

            return results;
        }
        catch (MinioException e)
        {
            throw new InfrastructureException(e.Message);
        }
    }

    public async Task<string> GetShareLinkAsync(string bucketName, string objectName, int expireTimeMinutes)
    {
        try
        {
            var args = new PresignedGetObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectName)
                .WithExpiry(expireTimeMinutes * 60);

            return await _minioClient.PresignedGetObjectAsync(args);
        }
        catch (Exception e)
        {
            throw new InfrastructureException(e.Message);
        }
    }

    #region Helpers

    /// <summary>
    /// Đảm bảo bucket tồn tại trên MinIO trước khi thực hiện các thao tác khác.
    /// Nếu bucket chưa tồn tại, sẽ tự động tạo mới và cấu hình quyền truy cập.
    /// </summary>
    /// <param name="bucketName">Tên của bucket cần kiểm tra/tạo</param>
    /// <param name="isPublicBucket">Nếu true, bucket sẽ được cấu hình cho phép truy cập công khai (public read)</param>
    /// <param name="ct">Token để hủy thao tác</param>
    private async Task EnsureBucketAsync(string bucketName, bool isPublicBucket, CancellationToken ct)
    {
        // Bước 1: Kiểm tra xem bucket đã tồn tại trên MinIO chưa
        var exists = await _minioClient
            .BucketExistsAsync(new BucketExistsArgs().WithBucket(bucketName), ct);

        // Bước 2: Nếu bucket chưa tồn tại, tiến hành tạo mới
        if (!exists)
        {
            // Tạo bucket mới với tên được chỉ định
            await _minioClient.MakeBucketAsync(new MakeBucketArgs().WithBucket(bucketName), ct);

            // Bước 3: Nếu yêu cầu bucket công khai, cấu hình policy cho phép đọc file
            if (isPublicBucket)
            {
                // Định nghĩa policy theo chuẩn AWS S3
                // - Version: Phiên bản định dạng policy (chuẩn AWS)
                // - Statement: Danh sách các quy tắc truy cập
                //   + Effect: "Allow" - Cho phép thực hiện hành động
                //   + Principal: "*" - Áp dụng cho tất cả mọi người (public)
                //   + Action: "s3:GetObject" - Chỉ cho phép đọc/tải file
                //   + Resource: Áp dụng cho tất cả file trong bucket này
                var policy = new
                {
                    Version = "2012-10-17",
                    Statement = new[]
                    {
                        new
                        {
                            Effect = "Allow",
                            Principal = "*",
                            Action = new[] { "s3:GetObject" },
                            Resource = $"arn:aws:s3:::{bucketName}/*"
                        }
                    }
                };

                // Chuyển policy thành JSON và gửi lên MinIO
                var policyJson = JsonSerializer.Serialize(policy);
                await _minioClient.SetPolicyAsync(
                    new SetPolicyArgs().WithBucket(bucketName).WithPolicy(policyJson), ct
                );
            }
        }
    }

    #endregion
}
