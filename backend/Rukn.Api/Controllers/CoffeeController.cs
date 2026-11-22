using Microsoft.AspNetCore.Mvc;
using Rukn.Api.DTOs;
using Rukn.Api.Services.Interfaces;

namespace Rukn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CoffeeController : ControllerBase
{
    private readonly ICoffeeService _coffeeService;

    public CoffeeController(ICoffeeService coffeeService)
    {
        _coffeeService = coffeeService;
    }

    [HttpGet("today")]
    [ProducesResponseType(typeof(DailyCoffeeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTodayCoffee(CancellationToken ct)
    {
        var coffee = await _coffeeService.GetTodayCoffeeAsync(ct);
        return Ok(coffee);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<DailyCoffeeResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllCoffees(CancellationToken ct)
    {
        var coffees = await _coffeeService.GetAllCoffeesAsync(ct);
        return Ok(coffees);
    }
}
