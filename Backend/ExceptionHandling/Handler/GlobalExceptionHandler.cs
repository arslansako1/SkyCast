

using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

public sealed class GlobalExceptionHander(ILogger<GlobalExceptionHander> logger, IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct)
    {
        logger.LogError(exception, "Unhandled exception occured traceId {traceId}", context.TraceIdentifier);

        var (statusCode, title) = MapException(exception);

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Type = GetProblemType(statusCode),
            Instance = context.Request.Path,
            Detail = GetSafeErrorMessage(exception, context)
        };

        problemDetails.Extensions["traceId"] = context.TraceIdentifier;
        problemDetails.Extensions["TimeStamp"] = DateTime.UtcNow;

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            ProblemDetails = problemDetails
        });

    }

    private static (int StatusCode, string title) MapException(Exception exception) => exception switch
    {
        AppException appEx => ((int)appEx.StatusCode, appEx.Message),
        ArgumentNullException => (StatusCodes.Status400BadRequest, "Invalid argument provided"),
        ArgumentException => (StatusCodes.Status400BadRequest, "Invalid argument provided"),
        UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Unauthorized"),
        _ => (StatusCodes.Status500InternalServerError, "An unexpected error occured")
    };

    private static string GetProblemType(int statusCode) => statusCode switch
    {
        400 => "https://tools.ietf.org/html/rfc9110#section-15.5.1",
        401 => "https://tools.ietf.org/html/rfc9110#section-15.5.2",
        403 => "https://tools.ietf.org/html/rfc9110#section-15.5.4",
        404 => "https://tools.ietf.org/html/rfc9110#section-15.5.5",
        409 => "https://tools.ietf.org/html/rfc9110#section-15.5.10",
        _ => "https://tools.ietf.org/html/rfc9110#section-15.6.1"
    };

    private static string? GetSafeErrorMessage(Exception exception, HttpContext context)
    {
        var env = context.RequestServices.GetRequiredService<IHostEnvironment>();
        if (env.IsDevelopment())
        {
            return exception.Message;
        }
        return exception is AppException ? exception.Message : null;
    }

}