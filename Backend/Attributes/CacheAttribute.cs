using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using SkyCast.API.Services;

namespace SkyCast.API.Attributes
{
    public class CacheAttribute : Attribute, IActionFilter
    {
        private readonly int _durationMinutes;

        public CacheAttribute(int durationMinutes = 10)
        {
            _durationMinutes = durationMinutes;
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            var cache = context.HttpContext.RequestServices.GetService<CacheService>();
            if (cache == null) return;

            var controller = context.RouteData.Values["controller"]?.ToString() ?? "unknown";
            var action = context.RouteData.Values["action"]?.ToString() ?? "unknown";
            var city = context.HttpContext.Request.Query["city"].ToString();

            if (string.IsNullOrEmpty(city))
            {
                context.RouteData.Values.TryGetValue("city", out var cityRoute);
                city = cityRoute?.ToString() ?? "";
            }

            var cacheKey = $"{controller}_{action}_{city}".ToLower();

            var cachedData = cache.Get<object>(cacheKey);
            if (cachedData != null)
            {
                context.Result = new OkObjectResult(cachedData);
                Console.WriteLine($"CACHE HIT {cacheKey}");
            }
            else
            {
                context.HttpContext.Items["CacheKey"] = cacheKey;
                context.HttpContext.Items["CacheDuration"] = _durationMinutes;
                Console.WriteLine($"CACHE MISS {cacheKey}");
            }
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (context.Result is OkObjectResult okResult && okResult.Value != null)
            {
                var cache = context.HttpContext.RequestServices.GetService<CacheService>();
                if (cache == null) return;

                var cacheKey = context.HttpContext.Items["CacheKey"]?.ToString();
                if (string.IsNullOrEmpty(cacheKey)) return;

                var duration = context.HttpContext.Items["CacheDuration"] as int? ?? 10;

                cache.Set(cacheKey, okResult.Value, duration);
                Console.WriteLine($"CACHED {cacheKey} ({duration} min)");
            }
        }
    }
}