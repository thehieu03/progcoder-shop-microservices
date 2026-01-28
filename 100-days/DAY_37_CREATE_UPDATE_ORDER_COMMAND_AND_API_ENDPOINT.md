# 📘 Day 37: Create UpdateOrder Command & API Endpoint

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Cho phép cập nhật thông tin đơn hàng (Update Order) theo CQRS Command.

Gợi ý phạm vi update (tùy domain của bạn):
- Cập nhật **Shipping Address**
- Cập nhật **Note** (ghi chú)
- (Tuỳ chọn) Cập nhật **Order Items** nếu order chưa vào trạng thái xử lý

Bạn sẽ:

1. **Domain**: Xác định rule cho phép update (chỉ khi `Pending/Created` chẳng hạn).
2. **Definitions**: Tạo DTO + `UpdateOrderCommand`.
3. **Validation**: Tạo FluentValidation validator.
4. **Implementation**: Implement `UpdateOrderCommandHandler`.
5. **Endpoint**: Expose API endpoint bằng Carter.
6. **Testing**: Verify qua Swagger.

**Thời gian ước tính**: 60-90 phút.

---

## ✅ Checklist - Đánh dấu khi hoàn thành

### Domain Layer

- [ ] Xác định trạng thái nào được phép update
- [ ] Thêm method domain `UpdateShippingAddress(...)` / `UpdateNote(...)` (hoặc method tương đương)
- [ ] Đảm bảo domain rule throw exception rõ ràng khi update sai trạng thái

### Application Layer

- [ ] Verify DTO `CreateOrUpdateOrderDto` (reuse cho Create/Update)
- [ ] Create/Verify `UpdateOrderCommand`
- [ ] Create/Verify `UpdateOrderCommandValidator`
- [ ] Create/Verify `UpdateOrderCommandHandler`
- [ ] Implement update + save changes (UnitOfWork/DbContext)
- [ ] Return `OrderDto` (hoặc `bool`/`Guid`) theo convention hiện có

### API Layer

- [ ] Verify route `Update` trong `ApiRoutes`
- [ ] Create `UpdateOrder` endpoint
- [ ] Add swagger responses (200/400/401/403/404)
- [ ] RequireAuthorization (Owner/Admin)

### Testing

- [ ] Update order valid -> 200 OK
- [ ] Update order invalid state -> 400/409
- [ ] Update order not found -> 404

---

## 📋 Hướng dẫn chi tiết từng bước

### 0) Các file liên quan trong project

- `src/Services/Order/Core/Order.Application/Dtos/Orders/CreateOrUpdateOrderDto.cs`
- `src/Services/Order/Core/Order.Application/Features/Order/Commands/UpdateOrderCommand.cs`
- `src/Services/Order/Api/Order.Api/Endpoints/UpdateOrder.cs`
- `src/Services/Order/Api/Order.Api/Constants/ApiRoutes.cs`
- `src/Services/Order/Core/Order.Domain/Entities/OrderEntity.cs`

### 1) DTO (reuse cho Create/Update)

File: `src/Services/Order/Core/Order.Application/Dtos/Orders/CreateOrUpdateOrderDto.cs`

```csharp
#region using

using Order.Application.Dtos.ValueObjects;

#endregion

namespace Order.Application.Dtos.Orders;

public sealed class CreateOrUpdateOrderDto
{
    public Guid? BasketId { get; set; }
    public CustomerDto Customer { get; set; } = default!;
    public AddressDto ShippingAddress { get; set; } = default!;
    public List<CreateOrderItemDto> OrderItems { get; set; } = [];
    public string CouponCode { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
```

### 2) Domain methods để update (đã có)

File: `src/Services/Order/Core/Order.Domain/Entities/OrderEntity.cs`

```csharp
public void UpdateShippingAddress(Address shippingAddress, string performBy)
{
    ShippingAddress = shippingAddress;
    LastModifiedBy = performBy;
    LastModifiedOnUtc = DateTimeOffset.UtcNow;
}

public void UpdateCustomerInfo(Customer customer, string performBy)
{
    Customer = customer;
    LastModifiedBy = performBy;
    LastModifiedOnUtc = DateTimeOffset.UtcNow;
}
```

Lưu ý: Rule chặn update theo trạng thái hiện được enforce trong **handler**.

### 3) Command + Validator + Handler

File: `src/Services/Order/Core/Order.Application/Features/Order/Commands/UpdateOrderCommand.cs`

```csharp
#region using

using Order.Application.Dtos.Orders;
using Order.Application.Services;
using Order.Domain.Abstractions;
using Order.Domain.Enums;
using Order.Domain.ValueObjects;

#endregion

namespace Order.Application.Features.Order.Commands;

public sealed record UpdateOrderCommand(Guid OrderId, CreateOrUpdateOrderDto Dto, Actor Actor) : ICommand<Guid>;

public sealed class UpdateOrderCommandValidator : AbstractValidator<UpdateOrderCommand>
{
    public UpdateOrderCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty()
            .WithMessage(MessageCode.BadRequest);

        RuleFor(x => x.Dto)
            .NotNull()
            .WithMessage(MessageCode.BadRequest)
            .DependentRules(() =>
            {
                RuleFor(x => x.Dto.Customer)
                    .NotNull()
                    .WithMessage(MessageCode.BadRequest)
                    .DependentRules(() =>
                    {
                        RuleFor(x => x.Dto.Customer.Name)
                            .NotEmpty()
                            .WithMessage(MessageCode.NameIsRequired);

                        RuleFor(x => x.Dto.Customer.Email)
                            .NotEmpty()
                            .WithMessage(MessageCode.EmailIsRequired)
                            .EmailAddress()
                            .WithMessage(MessageCode.InvalidEmailAddress);

                        RuleFor(x => x.Dto.Customer.PhoneNumber)
                            .NotEmpty()
                            .WithMessage(MessageCode.PhoneNumberIsRequired)
                            .IsValidPhoneNumber()
                            .WithMessage(MessageCode.InvalidPhoneNumber);
                    });

                RuleFor(x => x.Dto.ShippingAddress)
                    .NotNull()
                    .WithMessage(MessageCode.BadRequest)
                    .DependentRules(() =>
                    {
                        RuleFor(x => x.Dto.ShippingAddress.AddressLine)
                            .NotEmpty()
                            .WithMessage(MessageCode.AddressLineIsRequired);

                        RuleFor(x => x.Dto.ShippingAddress.Subdivision)
                            .NotEmpty()
                            .WithMessage(MessageCode.SubdivisionIsRequired);

                        RuleFor(x => x.Dto.ShippingAddress.City)
                            .NotEmpty()
                            .WithMessage(MessageCode.CityIsRequired);

                        RuleFor(x => x.Dto.ShippingAddress.StateOrProvince)
                            .NotEmpty()
                            .WithMessage(MessageCode.StateOrProvinceIsRequired);

                        RuleFor(x => x.Dto.ShippingAddress.Country)
                            .NotEmpty()
                            .WithMessage(MessageCode.CountryIsRequired);

                        RuleFor(x => x.Dto.ShippingAddress.PostalCode)
                            .NotEmpty()
                            .WithMessage(MessageCode.PostalCodeIsRequired);
                    });

                RuleFor(x => x.Dto.OrderItems)
                    .NotNull()
                    .WithMessage(MessageCode.BadRequest)
                    .Must(items => items != null && items.Count > 0)
                    .WithMessage(MessageCode.OrderItemsIsRequired)
                    .DependentRules(() =>
                    {
                        RuleForEach(x => x.Dto.OrderItems).ChildRules(item =>
                        {
                            item.RuleFor(i => i.ProductId)
                                .NotEmpty()
                                .WithMessage(MessageCode.ProductIdIsRequired);

                            item.RuleFor(i => i.Quantity)
                                .GreaterThan(0)
                                .WithMessage(MessageCode.QuantityCannotBeNegative);
                        });
                    });
            });
    }
}

public sealed class UpdateOrderCommandHandler(IUnitOfWork unitOfWork, ICatalogGrpcService catalogGrpc) : ICommandHandler<UpdateOrderCommand, Guid>
{
    public async Task<Guid> Handle(UpdateOrderCommand command, CancellationToken cancellationToken)
    {
        var existingOrder = await unitOfWork.Orders.GetByIdWithRelationshipAsync(command.OrderId, cancellationToken)
            ?? throw new NotFoundException(MessageCode.ResourceNotFound, command.OrderId);

        if (existingOrder.Status == OrderStatus.Delivered ||
            existingOrder.Status == OrderStatus.Canceled ||
            existingOrder.Status == OrderStatus.Refunded)
        {
            throw new ClientValidationException(MessageCode.OrderCannotBeUpdated);
        }

        var dto = command.Dto;
        var customer = Customer.Of(
            dto.Customer.Id,
            dto.Customer.PhoneNumber,
            dto.Customer.Name,
            dto.Customer.Email);
        var shippingAddress = Address.Of(
            dto.ShippingAddress.AddressLine,
            dto.ShippingAddress.Subdivision,
            dto.ShippingAddress.City,
            dto.ShippingAddress.Country,
            dto.ShippingAddress.StateOrProvince,
            dto.ShippingAddress.PostalCode);

        existingOrder.UpdateCustomerInfo(customer, command.Actor.ToString());
        existingOrder.UpdateShippingAddress(shippingAddress, command.Actor.ToString());

        var productIds = dto.OrderItems
            .Select(x => x.ProductId.ToString())
            .Distinct()
            .ToArray();

        var productsResponse = await catalogGrpc.GetProductsAsync(ids: productIds, cancellationToken: cancellationToken);

        if (productsResponse == null || productsResponse.Items == null || productsResponse.Items.Count == 0)
        {
            throw new ClientValidationException(MessageCode.ProductIsNotExists);
        }

        var validProducts = productsResponse.Items.ToDictionary(p => p.Id, p => p);
        var dtoProductIdSet = dto.OrderItems.Select(i => i.ProductId).ToHashSet();
        var toRemove = existingOrder.OrderItems
            .Where(oi => !validProducts.ContainsKey(oi.Product.Id) || !dtoProductIdSet.Contains(oi.Product.Id))
            .Select(oi => oi.Product.Id)
            .ToList();

        foreach (var productId in toRemove)
        {
            existingOrder.RemoveOrderItem(productId);
        }

        foreach (var item in dto.OrderItems)
        {
            var alreadyProcessed = existingOrder.OrderItems.Any(oi => oi.Product.Id == item.ProductId) &&
                                    dto.OrderItems.First(i => i.ProductId == item.ProductId) != item;
            if (alreadyProcessed) continue;

            if (!validProducts.TryGetValue(item.ProductId, out var productInfo))
            {
                continue;
            }

            var existingItem = existingOrder.OrderItems.FirstOrDefault(oi => oi.Product.Id == item.ProductId);
            if (existingItem == null)
            {
                var product = Product.Of(
                    productInfo.Id,
                    productInfo.Name,
                    productInfo.Price,
                    productInfo.Thumbnail);

                existingOrder.AddOrderItem(product, item.Quantity);
            }
            else if (existingItem.Quantity != item.Quantity)
            {
                existingOrder.RemoveOrderItem(item.ProductId);

                var product = Product.Of(
                    productInfo.Id,
                    productInfo.Name,
                    productInfo.Price,
                    productInfo.Thumbnail);

                existingOrder.AddOrderItem(product, item.Quantity);
            }
        }

        unitOfWork.Orders.Update(existingOrder);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return existingOrder.Id;
    }
}
```

### 4) Route constants + Endpoint

File: `src/Services/Order/Api/Order.Api/Constants/ApiRoutes.cs`

```csharp
public const string Update = $"{BaseAdmin}/{{orderId}}";
```

File: `src/Services/Order/Api/Order.Api/Endpoints/UpdateOrder.cs`

```csharp
#region using

using BuildingBlocks.Authentication.Extensions;
using Microsoft.AspNetCore.Mvc;
using Order.Api.Constants;
using Order.Application.Features.Order.Commands;
using Order.Application.Dtos.Orders;

#endregion

namespace Order.Api.Endpoints;

public class UpdateOrder : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPut(ApiRoutes.Order.Update, HandleUpdateOrderAsync)
            .WithTags(ApiRoutes.Order.Tags)
            .WithName(nameof(UpdateOrder))
            .Produces<ApiUpdatedResponse<Guid>>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
    }

    private async Task<ApiUpdatedResponse<Guid>> HandleUpdateOrderAsync(
        ISender sender,
        IHttpContextAccessor httpContext,
        [FromRoute] Guid orderId,
        [FromBody] CreateOrUpdateOrderDto dto)
    {
        var currentUser = httpContext.GetCurrentUser();
        var command = new UpdateOrderCommand(orderId, dto, Actor.User(currentUser.Email));
        var result = await sender.Send(command);

        return new ApiUpdatedResponse<Guid>(result);
    }
}
```

## 🧪 Test qua Swagger (10-15 phút)

- **Bước 1**: Tạo order
  - `POST /admin/orders`
- **Bước 2**: Update order
  - `PUT /admin/orders/{orderId}`
- **Bước 3**: Verify kết quả
  - Gọi `GET /admin/orders/{orderId}` để xem lại data

Các case lỗi cần test:
- OrderId không tồn tại -> `404 NotFound` (`MessageCode.ResourceNotFound`)
- Order đang `Delivered/Canceled/Refunded` -> `422/400` (tuỳ exception handler) với `MessageCode.OrderCannotBeUpdated`

---
 
**Chúc bạn hoàn thành tốt Day 37!**
