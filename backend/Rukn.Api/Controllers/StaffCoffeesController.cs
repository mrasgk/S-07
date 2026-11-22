using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rukn.Api.DTOs;
using Rukn.Api.Services.Interfaces;

namespace Rukn.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/staff/coffees")]
[Produces("application/json")]
public class StaffCoffeesController : ControllerBase
{
    private readonly ICoffeeService _coffeeService;

    public StaffCoffeesController(ICoffeeService coffeeService)
    {
        _coffeeService = coffeeService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<DailyCoffeeResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var list = await _coffeeService.GetAllCoffeesAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(DailyCoffeeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var coffee = await _coffeeService.GetCoffeeByIdAsync(id, ct);
        return Ok(coffee);
    }

    [HttpPost]
    [ProducesResponseType(typeof(DailyCoffeeResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateCoffeeRequest request, CancellationToken ct)
    {
        var created = await _coffeeService.CreateCoffeeAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(DailyCoffeeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCoffeeRequest request, CancellationToken ct)
    {
        var updated = await _coffeeService.UpdateCoffeeAsync(id, request, ct);
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/availability")]
    [ProducesResponseType(typeof(DailyCoffeeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAvailability(Guid id, [FromBody] UpdateCoffeeAvailabilityRequest request, CancellationToken ct)
    {
        var updated = await _coffeeService.UpdateAvailabilityAsync(id, request.IsAvailable, ct);
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/inventory")]
    [ProducesResponseType(typeof(DailyCoffeeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateInventory(Guid id, [FromBody] UpdateCoffeeInventoryRequest request, CancellationToken ct)
    {
        var updated = await _coffeeService.UpdateInventoryAsync(id, request.AvailableQuantity, ct);
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _coffeeService.DeleteCoffeeAsync(id, ct);
        return Ok(new { message = "تم حذف أو تعطيل المحصول بنجاح." });
    }
}
