using Microsoft.EntityFrameworkCore;
using Rukn.Api.Entities;

namespace Rukn.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context, IConfiguration config)
    {
        await context.Database.EnsureCreatedAsync();

        // Ensure __EFMigrationsHistory is populated so EF migrations tools know the DB schema is applied
        try
        {
            await context.Database.ExecuteSqlRawAsync(
                @"INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                  VALUES ('20261122122301_UpdatedSchema', '8.0.11'),
                         ('20261122155042_ExpandOrderStatus', '8.0.11')
                  ON CONFLICT (""MigrationId"") DO NOTHING;");
        }
        catch
        {
            // Ignore if table not ready
        }

        // 1. Seed or update DailyCoffee
        var existingCoffee = await context.DailyCoffees.FirstOrDefaultAsync(c => c.Id == AppDbContext.DemoCoffeeId);
        if (existingCoffee is null)
        {
            context.DailyCoffees.Add(new DailyCoffee
            {
                Id = AppDbContext.DemoCoffeeId,
                Name = "إثيوبيا سيداما",
                Description = "قهوة مختصة بنكهة متوازنة تجمع بين الانتعاش والحلاوة الطبيعية.",
                Origin = "إثيوبيا",
                RoastLevel = "تحميص متوسط",
                TastingNotes = "الياسمين، الحمضيات، العسل",
                ImageUrl = "/coffee-today.png",
                Price = 35.00m,
                AvailableQuantity = 20,
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        // 2. Seed development staff account
        var staffUsername = config["DevStaff:Username"] ?? "baristarukn";
        var staffPassword = config["DevStaff:Password"] ?? "Rukn2026!";

        var existingStaff = await context.StaffUsers.FirstOrDefaultAsync(s => s.Username == staffUsername);
        var validHash = BCrypt.Net.BCrypt.HashPassword(staffPassword, workFactor: 11);

        if (existingStaff is null)
        {
            context.StaffUsers.Add(new StaffUser
            {
                Id = AppDbContext.DemoStaffId,
                Username = staffUsername,
                PasswordHash = validHash,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            });
            await context.SaveChangesAsync();
        }
        else
        {
            // Ensure hash matches development password
            existingStaff.PasswordHash = validHash;
            existingStaff.IsActive = true;
            await context.SaveChangesAsync();
        }
    }
}
