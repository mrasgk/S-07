using System.ComponentModel.DataAnnotations;
using Rukn.Api.Enums;

namespace Rukn.Api.Entities;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(50)]
    public string OrderNumber { get; set; } = string.Empty;

    public Guid DailyCoffeeId { get; set; }
    public DailyCoffee DailyCoffee { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string CoffeeNameSnapshot { get; set; } = string.Empty;

    [Range(0.01, 10000.0)]
    public decimal UnitPriceSnapshot { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; }

    [Range(0.01, 100000.0)]
    public decimal TotalPrice { get; set; }

    [Required]
    [MaxLength(100)]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string CustomerPhone { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? CustomerNote { get; set; }

    [MaxLength(500)]
    public string? CancellationReason { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.New;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
