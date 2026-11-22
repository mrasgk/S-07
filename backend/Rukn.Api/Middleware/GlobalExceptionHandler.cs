using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Rukn.Api.Exceptions;

namespace Rukn.Api.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);

        var (statusCode, title, detail) = exception switch
        {
            ResourceNotFoundException rnf => (StatusCodes.Status404NotFound, "Resource Not Found", rnf.Message),
            OutOfStockException oos => (StatusCodes.Status409Conflict, "Inventory Depleted", oos.Message),
            DomainValidationException dve => (StatusCodes.Status400BadRequest, "Business Validation Error", dve.Message),
            _ => (StatusCodes.Status500InternalServerError, "Server Error", "حدث خطأ غير متوقع أثناء معالجة الطلب.")
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
