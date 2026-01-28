using Payment.Domain.Repositories;

namespace Payment.Domain.Abstractions;

public interface IUnitOfWork
{
    #region Fields, Properties and Indexers

    IPaymentRepository Payments { get; }

    #endregion

    #region Methods

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    Task<IDbTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);

    #endregion
}
