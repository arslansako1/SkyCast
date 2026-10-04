using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using SkyCast.API.Services;

namespace SkyCast.API.Attributes
{
    public class RateLimitAttribute : Attribute, IActionFilter
    {
        private readonly int _maxRequests;
        private readonly int _windowSeconds;

        public RateLimitAttribute(int maxRequests = 60, int windowSeconds = 60)
        {
            _maxRequests = maxRequests;
            _windowSeconds = windowSeconds;
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            var rateLimiter = context.HttpContext.RequestServices.GetService<RateLimiterService>();
            if (rateLimiter == null) return;

            var userId = context.HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                         ?? context.HttpContext.Connection.RemoteIpAddress?.ToString() 
                         ?? "unknown";

            if (!rateLimiter.IsAllowed(userId, out int waitSeconds))
            {
                context.Result = new ObjectResult(new
                {
                    message = $"Too many requests. Please wait {waitSeconds} seconds."
                })
                {
                    StatusCode = 429
                };
            }
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
        }
    }
}