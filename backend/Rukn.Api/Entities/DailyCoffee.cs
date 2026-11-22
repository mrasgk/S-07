using System.ComponentModel.DataAnnotations;

namespace Rukn.Api.Entities;

public class DailyCoffee
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string? Origin { get; set; } // e.g. إثيوبيا

    [MaxLength(100)]
    public string? RoastLevel { get; set; } // e.g. تحميص متوسط

    [MaxLength(200)]
    public string? TastingNotes { get; set; } // e.g. الياسمين، الحمضيات، العسل

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    [Range(0.01, 10000.0)]
    public decimal Price { get; set; }

    [Range(0, 10000)]
    public int AvailableQuantity { get; set; }

    public bool IsAvailable { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
