# 📘 Day 82: Implement Email Sender (SMTP)

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Xây dựng module gửi mail thực tế (Notification Service).
**Tech**: `MailKit` (library gửi mail tốt nhất cho .NET).
**Pattern**: Dependency Injection `IEmailSender`.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Create `EmailSettings` class.
- [ ] Create `IEmailSender` interface.
- [ ] Implement `SmtpEmailSender` (MailKit).
- [ ] Register DI in `Program.cs`.
- [ ] Update `OrderCreatedConsumer` to send real email.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Email Settings (15 phút)

`src/Services/Notification/Notification.Worker/Settings/EmailSettings.cs`:

```csharp
namespace Notification.Worker.Settings;

public class EmailSettings
{
    public string Host { get; set; } = default!;
    public int Port { get; set; }
    public string FromEmail { get; set; } = default!;
    public string FromName { get; set; } = default!;
    public string UserName { get; set; } = default!;
    public string Password { get; set; } = default!;
}
```

`appsettings.json`:

```json
"EmailSettings": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "FromEmail": "your-email@gmail.com",
    "FromName": "Progcoder Shop",
    "UserName": "your-email@gmail.com",
    "Password": "your-app-password"
}
```

> _Tips: Nếu dùng Gmail, bạn cần tạo "App Password" chứ không dùng password đăng nhập thường._

### Bước 2: Interface & Implementation (40 phút)

`src/Services/Notification/Notification.Worker/Services/IEmailSender.cs`:

```csharp
public interface IEmailSender
{
    Task SendEmailAsync(string to, string subject, string body);
}
```

`src/Services/Notification/Notification.Worker/Services/SmtpEmailSender.cs`:

```csharp
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using Notification.Worker.Settings;

namespace Notification.Worker.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly EmailSettings _settings;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<EmailSettings> settings, ILogger<SmtpEmailSender> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = body
            };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_settings.UserName, _settings.Password);

            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("✅ Email sent to {To}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to send email to {To}", to);
            // Không throw exception để tránh retry vô tận nếu lỗi config,
            // nhưng nếu lỗi mạng thì nên throw để MassTransit retry.
            // Ở đây demo nên ta catch hết.
        }
    }
}
```

### Bước 3: Register DI (10 phút)

`Program.cs`:

```csharp
using Notification.Worker.Services;
using Notification.Worker.Settings;

// ...

builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();
```

### Bước 4: Update Consumer (25 phút)

Sửa lại `OrderCreatedConsumer.cs` (Day 81):

```csharp
using Notification.Worker.Services;

public class OrderCreatedConsumer : IConsumer<OrderCreatedIntegrationEvent>
{
    private readonly ILogger<OrderCreatedConsumer> _logger;
    private readonly IEmailSender _emailSender; // Inject

    public OrderCreatedConsumer(ILogger<OrderCreatedConsumer> logger, IEmailSender emailSender)
    {
        _logger = logger;
        _emailSender = emailSender;
    }

    public async Task Consume(ConsumeContext<OrderCreatedIntegrationEvent> context)
    {
        var message = context.Message;
        _logger.LogInformation("🔔 Sending email for Order {OrderId}", message.OrderId);

        // Giả sử Event chưa có Email khách hàng, ta tạm hardcode hoặc lấy từ User Service (API call).
        // Best practice: Event nên chứa đủ info (Email, Name) để Consumer không phải query ngược lại.
        // Giả sử ta sửa Integration Event để có Email, hoặc tạm dùng email test của bạn.

        var customerEmail = "test-customer@example.com";

        var body = $@"
            <h1>Order Confirmation</h1>
            <p>Thank you for your order!</p>
            <p>Order ID: {message.OrderId}</p>
            <p>Total: {message.FinalPrice}</p>
        ";

        await _emailSender.SendEmailAsync(customerEmail, $"Order {message.OrderId} Confirmed", body);
    }
}
```

---

**Chúc bạn hoàn thành tốt Day 82!**
