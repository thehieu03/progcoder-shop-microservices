using Payment.Domain.Entities;

namespace Payment.Domain.Repositories;

public interface IPaymentRepository
{
    Task<PaymentEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PaymentEntity?> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default);
    void Add(PaymentEntity payment);
    void Update(PaymentEntity payment);
}
