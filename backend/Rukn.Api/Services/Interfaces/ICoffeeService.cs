using Rukn.Api.DTOs;

namespace Rukn.Api.Services.Interfaces;

/// <summary>
/// Service interface governing daily specialty coffee offerings and inventory configuration.
/// </summary>
public interface ICoffeeService
{
    /// <summary>
    /// Retrieves today's active coffee offering.
    /// </summary>
    Task<DailyCoffeeResponseDto> GetTodayCoffeeAsync(CancellationToken ct = default);

    /// <summary>
    /// Lists all specialty coffees in the catalog.
    /// </summary>
    Task<IReadOnlyList<DailyCoffeeResponseDto>> GetAllCoffeesAsync(CancellationToken ct = default);

    /// <summary>
    /// Retrieves a specific coffee by its unique identifier.
    /// </summary>
    Task<DailyCoffeeResponseDto> GetCoffeeByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Creates a new specialty coffee offering.
    /// </summary>
    Task<DailyCoffeeResponseDto> CreateCoffeeAsync(CreateCoffeeRequest request, CancellationToken ct = default);

    /// <summary>
    /// Updates details and tasting profile for an existing coffee.
    /// </summary>
    Task<DailyCoffeeResponseDto> UpdateCoffeeAsync(Guid id, UpdateCoffeeRequest request, CancellationToken ct = default);

    /// <summary>
    /// Toggles public availability of a coffee offering.
    /// </summary>
    Task<DailyCoffeeResponseDto> UpdateAvailabilityAsync(Guid id, bool isAvailable, CancellationToken ct = default);

    /// <summary>
    /// Sets the available cup quantity in stock.
    /// </summary>
    Task<DailyCoffeeResponseDto> UpdateInventoryAsync(Guid id, int availableQuantity, CancellationToken ct = default);

    /// <summary>
    /// Deletes a coffee offering from the catalog.
    /// </summary>
    Task<bool> DeleteCoffeeAsync(Guid id, CancellationToken ct = default);
}
