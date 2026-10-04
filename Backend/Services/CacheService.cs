

using System.Collections.Concurrent;
using Microsoft.AspNetCore.Routing.Tree;

public class CacheService
{
    private readonly ConcurrentDictionary<string, (object Data, DateTime Expiry)> _cache = new();

    public void Set(string key, object data, int minutes = 10)
    {
        _cache[key] = (data, DateTime.UtcNow.AddMinutes(minutes));
    }

    public T? Get<T>(string key)
    {
        if (_cache.TryGetValue(key, out var entry))
        {
            if (entry.Expiry > DateTime.UtcNow)
            {
                return (T)entry.Data;
            }
            else
            {
                _cache.TryRemove(key, out _);
            }
        }
            return default;  


    }
        public void Remove(string key) => _cache.TryRemove(key, out _);

    internal void Set(string key, object v, object minutes)
    {
        throw new NotImplementedException();
    }
}