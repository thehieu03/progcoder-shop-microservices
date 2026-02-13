#region using

using Catalog.Domain.Entities;
using Catalog.Domain.Events;
using Marten;
using MediatR;

#endregion

namespace Catalog.Application.Features.Product.Commands;

public record UnpublishProductCommand(Guid ProductId, Actor Actor) : ICommand<Guid>;

public class UnpublishProductCommandValidator : AbstractValidator<UnpublishProductCommand>
{
    #region Ctors

    public UnpublishProductCommandValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty()
            .WithMessage(MessageCode.ProductIdIsRequired);

        //RuleFor(x => x.Status)
        //    .IsInEnum()
        //    .Must(status => Enum.IsDefined(typeof(ProductStatus), status))
        //    .WithMessage(MessageCode.StatusIsInvalid);
    }

    #endregion
}

public class UnpublishProductCommandHandler(IDocumentSession session, IMediator mediator) : ICommandHandler<UnpublishProductCommand, Guid>
{
    #region Implementations

    public async Task<Guid> Handle(UnpublishProductCommand command, CancellationToken cancellationToken)
    {
        await session.BeginTransactionAsync(cancellationToken);

        var entity = await session.LoadAsync<ProductEntity>(command.ProductId)
            ?? throw new ClientValidationException(MessageCode.ProductIsNotExists, command.ProductId);

        entity.Unpublish(command.Actor.ToString());
        session.Store(entity);

        var @event = new UpsertedProductDomainEvent(
            entity.Id,
            entity.Name!,
            entity.Sku!,
            entity.Slug!,
            entity.Price,
            entity.SalePrice,
            entity.CategoryIds?.Select(id => id.ToString()).ToList(),
            entity.Images?.Select(img => img.PublicURL).Where(url => !string.IsNullOrWhiteSpace(url)).Cast<string>().ToList(),
            entity.Thumbnail?.PublicURL!,
            entity.Status,
            entity.CreatedOnUtc,
            entity.CreatedBy!,
            entity.LastModifiedOnUtc,
            entity.LastModifiedBy);

        await mediator.Publish(@event, cancellationToken);
        await session.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }

    #endregion

}