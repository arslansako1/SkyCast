

using System.Collections.Concurrent;

public class RateLimiterService
{
    private readonly ConcurrentDictionary<string, List<DateTime>> _requests = new();
    private readonly int _maxRequests;
    private readonly int _windowSeconds;

    public RateLimiterService(int maxRequests = 60, int windowSeconds = 10)
    {
        _maxRequests = maxRequests;
        _windowSeconds = windowSeconds;
    }

    public bool IsAllowed(string identifier, out int waitSeconds)
    {
        waitSeconds = 0;
        var now = DateTime.UtcNow;
        var windowSart = now.AddSeconds(-_windowSeconds);

        var userRequests = _requests.GetOrAdd(identifier, new List<DateTime>());

        lock (userRequests)
        {
            userRequests.RemoveAll(t => t < windowSart);

            if (userRequests.Count >= _maxRequests)
            {
                var oldest = userRequests.Min();
                waitSeconds = (int)(oldest.AddSeconds(_windowSeconds) - now).TotalSeconds;

                if (waitSeconds < 0)
                waitSeconds = 1;
                return false;
            }

            userRequests.Add(now);
            return true;
        }


    }
}