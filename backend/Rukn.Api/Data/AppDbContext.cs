using Microsoft.EntityFrameworkCore;
using Rukn.Api.Entities;
using Rukn.Api.Enums;

namespace Rukn.Api.Data;

public class AppDbContext : DbContext
{
    public static readonly Guid DemoCoffeeId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid DemoStaffId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<DailyCoffee> DailyCoffees => Set<DailyCoffee>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<StaffUser> StaffUsers => Set<StaffUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<DailyCoffee>(entity =>
        {
            entity.ToTable("DailyCoffees");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Origin).HasMaxLength(100);
            entity.Property(e => e.RoastLevel).HasMaxLength(100);
            entity.Property(e => e.TastingNotes).HasMaxLength(200);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.AvailableQuantity).IsRequired();
            entity.Property(e => e.IsAvailable).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasIndex(e => e.IsAvailable);

            // Development seed for today's coffee (إثيوبيا سيداما)
            entity.HasData(new DailyCoffee
            {
                Id = DemoCoffeeId,
                Name = "إثيوبيا سيداما",
                Description = "قهوة مختصة بنكهة متوازنة تجمع بين الانتعاش والحلاوة الطبيعية.",
                Origin = "إثيوبيا",
                RoastLevel = "تحميص متوسط",
                TastingNotes = "الياسمين، الحمضيات، العسل",
                ImageUrl = "/coffee-today.png",
                Price = 35.00m,
                AvailableQuantity = 20,
                IsAvailable = true,
                CreatedAt = new DateTime(2026, 11, 22, 12, 0, 0, DateTimeKind.Utc)
            });
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("Orders");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.OrderNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CoffeeNameSnapshot).IsRequired().HasMaxLength(100);
            entity.Property(e => e.UnitPriceSnapshot).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.Quantity).IsRequired();
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CustomerPhone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CustomerNote).HasMaxLength(250);
            entity.Property(e => e.CancellationReason).HasMaxLength(500);
            entity.Property(e => e.Status).HasConversion<int>().IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.ToTable(t => t.HasCheckConstraint(
                "CK_Orders_CancellationReason",
                "(\"Status\" = 4 AND \"CancellationReason\" IS NOT NULL AND length(trim(\"CancellationReason\")) > 0) OR (\"Status\" <> 4 AND \"CancellationReason\" IS NULL)"
            ));

            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);

            entity.HasOne(e => e.DailyCoffee)
                .WithMany(c => c.Orders)
                .HasForeignKey(e => e.DailyCoffeeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<StaffUser>(entity =>
        {
            entity.ToTable("StaffUsers");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasIndex(e => e.Username).IsUnique();

            // Development seed staff account: baristarukn
            entity.HasData(new StaffUser
            {
                Id = DemoStaffId,
                Username = "baristarukn",
                // Hash of "Rukn2026!":
                PasswordHash = "$2a$11$w1o2oZ3o4o5o6o7o8o9o0eN8y/k0h7u1s2t3a4f5f6u7s8e9r0hash",
                CreatedAt = new DateTime(2026, 11, 22, 12, 0, 0, DateTimeKind.Utc),
                IsActive = true
            });
        });
    }
}
