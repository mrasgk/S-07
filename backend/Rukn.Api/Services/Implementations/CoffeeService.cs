using Microsoft.EntityFrameworkCore;
using Rukn.Api.Data;
using Rukn.Api.DTOs;
using Rukn.Api.Entities;
using Rukn.Api.Exceptions;
using Rukn.Api.Services.Interfaces;

namespace Rukn.Api.Services.Implementations;

public class CoffeeService : ICoffeeService
{
    private readonly AppDbContext _context;

    public CoffeeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DailyCoffeeResponseDto> GetTodayCoffeeAsync(CancellationToken ct = default)
    {
        var coffee = await _context.DailyCoffees
            .AsNoTracking()
            .Where(c => c.IsAvailable && c.AvailableQuantity > 0)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => MapToDto(c))
            .FirstOrDefaultAsync(ct);

        if (coffee is null)
        {
            // Fallback to latest available even if quantity is low
            coffee = await _context.DailyCoffees
                .AsNoTracking()
                .Where(c => c.IsAvailable)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => MapToDto(c))
                .FirstOrDefaultAsync(ct);
        }

        if (coffee is null)
            throw new ResourceNotFoundException("عذرًا، لم يتم تحديد قهوة اليوم بعد.");

        return coffee;
    }

    public async Task<IReadOnlyList<DailyCoffeeResponseDto>> GetAllCoffeesAsync(CancellationToken ct = default)
    {
        return await _context.DailyCoffees
            .AsNoTracking()
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => MapToDto(c))
            .ToListAsync(ct);
    }

    public async Task<DailyCoffeeResponseDto> GetCoffeeByIdAsync(Guid id, CancellationToken ct = default)
    {
        var coffee = await _context.DailyCoffees
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (coffee is null)
            throw new ResourceNotFoundException("لم يتم العثور على منتج القهوة المطلوب.");

        return MapToDto(coffee);
    }

    public async Task<DailyCoffeeResponseDto> CreateCoffeeAsync(CreateCoffeeRequest request, CancellationToken ct = default)
    {
        ValidateCoffeeInput(request.Name, request.Description, request.Origin, request.RoastLevel, request.TastingNotes, request.Price, request.AvailableQuantity);

        var coffee = new DailyCoffee
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Origin = request.Origin.Trim(),
            RoastLevel = request.RoastLevel.Trim(),
            TastingNotes = request.TastingNotes.Trim(),
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim(),
            Price = request.Price,
            AvailableQuantity = request.AvailableQuantity,
            IsAvailable = request.IsAvailable,
            CreatedAt = DateTime.UtcNow
        };

        _context.DailyCoffees.Add(coffee);
        await _context.SaveChangesAsync(ct);

        return MapToDto(coffee);
    }

    public async Task<DailyCoffeeResponseDto> UpdateCoffeeAsync(Guid id, UpdateCoffeeRequest request, CancellationToken ct = default)
    {
        ValidateCoffeeInput(request.Name, request.Description, request.Origin, request.RoastLevel, request.TastingNotes, request.Price, request.AvailableQuantity);

        var coffee = await _context.DailyCoffees.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (coffee is null)
            throw new ResourceNotFoundException("لم يتم العثور على منتج القهوة للتعديل.");

        coffee.Name = request.Name.Trim();
        coffee.Description = request.Description.Trim();
        coffee.Origin = request.Origin.Trim();
        coffee.RoastLevel = request.RoastLevel.Trim();
        coffee.TastingNotes = request.TastingNotes.Trim();
        coffee.ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim();
        coffee.Price = request.Price;
        coffee.AvailableQuantity = request.AvailableQuantity;
        coffee.IsAvailable = request.IsAvailable;
        coffee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        return MapToDto(coffee);
    }

    public async Task<DailyCoffeeResponseDto> UpdateAvailabilityAsync(Guid id, bool isAvailable, CancellationToken ct = default)
    {
        var coffee = await _context.DailyCoffees.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (coffee is null)
            throw new ResourceNotFoundException("لم يتم العثور على منتج القهوة.");

        coffee.IsAvailable = isAvailable;
        coffee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        return MapToDto(coffee);
    }

    public async Task<DailyCoffeeResponseDto> UpdateInventoryAsync(Guid id, int availableQuantity, CancellationToken ct = default)
    {
        if (availableQuantity < 0)
            throw new DomainValidationException("لا يمكن أن تكون الكمية المتاحة سالبة.");

        var coffee = await _context.DailyCoffees.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (coffee is null)
            throw new ResourceNotFoundException("لم يتم العثور على منتج القهوة.");

        coffee.AvailableQuantity = availableQuantity;
        coffee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        return MapToDto(coffee);
    }

    public async Task<bool> DeleteCoffeeAsync(Guid id, CancellationToken ct = default)
    {
        var coffee = await _context.DailyCoffees
            .Include(c => c.Orders)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (coffee is null)
            throw new ResourceNotFoundException("لم يتم العثور على منتج القهوة المراد حذفه.");

        // If coffee has associated orders, soft-delete / deactivate to preserve audit history
        if (coffee.Orders.Any())
        {
            coffee.IsAvailable = false;
            coffee.AvailableQuantity = 0;
            coffee.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(ct);
            return true;
        }

        // If no orders ever made, hard-delete
        _context.DailyCoffees.Remove(coffee);
        await _context.SaveChangesAsync(ct);
        return true;
    }

    private static void ValidateCoffeeInput(string name, string desc, string origin, string roast, string tasting, decimal price, int quantity)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Trim().Length < 2)
            throw new DomainValidationException("اسم القهوة مطلوب ويجب ألا يقل عن حرفين.");

        if (string.IsNullOrWhiteSpace(desc))
            throw new DomainValidationException("وصف القهوة مطلوب.");

        if (string.IsNullOrWhiteSpace(origin))
            throw new DomainValidationException("مصدر القهوة (الدولة/المنطقة) مطلوب.");

        if (string.IsNullOrWhiteSpace(roast))
            throw new DomainValidationException("مستوى التحميص مطلوب.");

        if (string.IsNullOrWhiteSpace(tasting))
            throw new DomainValidationException("الإيحاءات والنوتات العطرية مطلوبة.");

        if (price <= 0)
            throw new DomainValidationException("سعر الكوب يجب أن يكون قيمة موجبة بالدرهم.");

        if (quantity < 0)
            throw new DomainValidationException("الكمية المتاحة يجب أن تكون صفر أو أكثر.");
    }

    private static DailyCoffeeResponseDto MapToDto(DailyCoffee c) => new(
        c.Id,
        c.Name,
        c.Description,
        c.Origin,
        c.RoastLevel,
        c.TastingNotes,
        c.ImageUrl,
        c.Price,
        c.AvailableQuantity,
        c.IsAvailable
    );
}
