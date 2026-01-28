using Payment.Domain.Abstractions;
using Payment.Domain.Enums;

namespace Payment.Domain.Entities;

public sealed class PaymentEntity : Aggregate<Guid>
{
    public Guid OrderId { get; private set; }
    public string? TransactionId { get; private set; }
    public decimal Amount { get; private set; }
    public PaymentStatus Status { get; private set; }
    public PaymentMethod Method { get; private set; }
    public string? ErrorMessage { get; private set; }

    private PaymentEntity() { } // For EF Core

    public static PaymentEntity Create(Guid orderId, decimal amount, PaymentMethod method)
    {
        return new PaymentEntity
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            Amount = amount,
            Method = method,
            Status = PaymentStatus.Pending,
            CreatedOnUtc = DateTimeOffset.UtcNow
        };
    }

    public void Complete(string transactionId)
    {
        Status = PaymentStatus.Completed;
        TransactionId = transactionId;
        LastModifiedOnUtc = DateTimeOffset.UtcNow;
    }

    public void MarkAsFailed(string errorMessage)
    {
        Status = PaymentStatus.Failed;
        ErrorMessage = errorMessage;
        LastModifiedOnUtc = DateTimeOffset.UtcNow;
    }
}
