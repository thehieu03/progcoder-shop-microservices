# 📘 Day 77: Setup Order Saga Orchestrator

## 🎯 Mục tiêu ngày hôm nay

**Feature**: Code khung sườn cho Saga State Machine.
**Tech**: `MassTransit.StateMachine`.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Define `OrderStateInstance` (Lưu trạng thái Saga vào DB).
- [ ] Define `OrderStateMachine` (Logic chuyển trạng thái).
- [ ] Configure `DbContext` & `MassTransit` for Saga.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Saga Instance (30 phút)

Class này đại diện cho 1 "instance" của quy trình xử lý đơn hàng. Nó sẽ được lưu vào Database (table `OrderState`).

File: `src/Services/Ordering/Ordering.Saga/OrderState.cs`

```csharp
using MassTransit;

namespace Ordering.Saga;

public class OrderState : SagaStateMachineInstance
{
    public Guid CorrelationId { get; set; } // ID duy nhất của Saga (thường là OrderId)
    public string CurrentState { get; set; } = default!; // State hiện tại: Initial, Reserved, Paid...

    // Data cần lưu tạm để dùng cho bước sau
    public Guid OrderId { get; set; }
    public Guid CustomerId { get; set; }
    public decimal TotalPrice { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### Bước 2: State Machine (45 phút)

File: `src/Services/Ordering/Ordering.Saga/OrderStateMachine.cs`

```csharp
using MassTransit;
using EventSourcing.Events.Orders; // Shared Events

namespace Ordering.Saga;

public class OrderStateMachine : MassTransitStateMachine<OrderState>
{
    // Define States
    public State Reserved { get; private set; } = default!;
    public State Paid { get; private set; } = default!;

    // Define Events (Input)
    public Event<OrderCreatedIntegrationEvent> OrderCreated { get; private set; } = default!;

    public OrderStateMachine()
    {
        InstanceState(x => x.CurrentState);

        // Khởi tạo Saga khi nhận event OrderCreated
        // Correlate bằng OrderId
        Event(() => OrderCreated, x => x.CorrelateById(m => m.Message.OrderId));

        // Define Flow
        Initially(
            When(OrderCreated)
                .Then(context =>
                {
                    // Logic khi nhận OrderCreated: Copy data vào State
                    context.Saga.OrderId = context.Message.OrderId;
                    context.Saga.CustomerId = context.Message.CustomerId;
                    context.Saga.TotalPrice = context.Message.FinalPrice;
                    context.Saga.CreatedAt = DateTime.UtcNow;
                })
                .TransitionTo(Reserved) // Chuyển state
                // .Publish(...) -> Gửi lệnh sang Catalog (làm ở Day 78)
        );
    }
}
```

### Bước 3: Configuration (15 phút)

`Program.cs` của `Ordering.Saga`:

````csharp
// DbContext lưu State
builder.Services.AddDbContext<OrderSagaDbContext>(...);

File: `src/Services/Ordering/Ordering.Saga/Data/OrderSagaDbContext.cs`

```csharp
using MassTransit.EntityFrameworkCoreIntegration;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ordering.Saga.Data;

public class OrderSagaDbContext : SagaDbContext
{
    public OrderSagaDbContext(DbContextOptions<OrderSagaDbContext> options) : base(options)
    {
    }

    protected override IEnumerable<ISagaClassMap> Configurations
    {
        get { yield return new OrderStateMap(); }
    }
}

public class OrderStateMap : SagaClassMap<OrderState>
{
    protected override void Configure(EntityTypeBuilder<OrderState> entity, ModelBuilder model)
    {
        entity.Property(x => x.CurrentState).HasMaxLength(64);
        entity.Property(x => x.TotalPrice).HasColumnType("decimal(18,2)");
    }
}
````

builder.Services.AddMassTransit(bus =>
{
// Register Saga
bus.AddSagaStateMachine<OrderStateMachine, OrderState>()
.EntityFrameworkRepository(r =>
{
r.ExistingDbContext<OrderSagaDbContext>();
r.UsePostgres();
});

    bus.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(...);
        cfg.ConfigureEndpoints(context);
    });

});

```

---

**Chúc bạn hoàn thành tốt Day 77!**
```
