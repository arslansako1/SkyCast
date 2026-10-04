using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkyCast.API.Attributes;


[ApiController]
[Route("api/weather")]
public class WeatherController(HttpClient _httpClient, IConfiguration _configuration) : ControllerBase
{

    [Cache(10)]
    [RateLimit(60, 60)]
    [HttpGet("GetCurrentWeather")]
    public async Task<ActionResult> GetCurrentWeatherAsync(string city)
    {

        if (string.IsNullOrWhiteSpace(city))
        {
            return BadRequest("City is required.");
        }

        var apiKey = _configuration["WeatherApi:Key"];

        if (string.IsNullOrEmpty(apiKey))
        {
            return StatusCode(500, "Weather API key is not configured.");
        }


        var url = $"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={apiKey}&units=metric";

        var response = await _httpClient.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            return NotFound($"City {city} not found.");
        }

        var json = await response.Content.ReadAsStringAsync();
        var weatherData = System.Text.Json.JsonSerializer.Deserialize<WeatherResponse>(json);

        var result = new
        {
            city = city,
            temp = weatherData?.Main?.Temp ?? 0,
            feelsLike = weatherData?.Main?.FeelsLike ?? 0,
            description = weatherData?.Weather?.FirstOrDefault()?.Description ?? "No description",
            icon = weatherData?.Weather?.FirstOrDefault()?.Icon ?? "",
            timezone = weatherData?.Timezone ?? 0
        };

        return Ok(result);
        
    }  


    [Cache(10)]
    [RateLimit(60, 60)]
    [HttpGet("GetForecast")]
    public async Task<ActionResult> getForecastAsync(string city, int days = 10)
    {
        if (string.IsNullOrWhiteSpace(city))
        {
            return BadRequest("City is required");
        }

        var apikey = _configuration["WeatherApi:Key"];

        if (string.IsNullOrEmpty(apikey))
        {
            return StatusCode(500, "Weather API key is not configured.");
        }

        var url = $"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={apikey}&units=metric";

        var response = await _httpClient.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            return NotFound($"City {city} not found");
        }
        
        var json = await response.Content.ReadAsStringAsync();
        var forecastData = System.Text.Json.JsonSerializer.Deserialize<ForecastResponse>(json);
        
        var forecastList = forecastData?.List ?? new List<ForecastItem>();

           var groupedByDay = forecastList
        .GroupBy(f => DateTime.Parse(f.DtTxt!).Date)
        .Select(group => new ForecastDay
        {
            Date = group.Key,
            Temp = Math.Round(group.Average(f => f.Main!.Temp), 1),
            FeelsLike = Math.Round(group.Average(f => f.Main!.FeelsLike), 1),
            Description = group.First().Weather?.FirstOrDefault()?.Description ?? "No description",
            Icon = group.First().Weather?.FirstOrDefault()?.Icon ?? "",
            Humidity = (int)Math.Round(group.Average(f => f.Main!.Humidity)),
            WindSpeed = Math.Round(group.Average(f => f.Wind?.Speed ?? 0), 1)
        })
        .Take(days)
        .ToList();

          var hourlyData = forecastList
        .Take(24)
        .Select(f => new
        {
            time = f.DtTxt,
            temp = Math.Round(f.Main!.Temp, 1),
            feelsLike = Math.Round(f.Main!.FeelsLike, 1),
            icon = f.Weather?.FirstOrDefault()?.Icon ?? "",
            description = f.Weather?.FirstOrDefault()?.Description ?? "",
            humidity = f.Main!.Humidity,
            windSpeed = Math.Round(f.Wind?.Speed ?? 0, 1)
        })
        .ToList();

        var result = new
        {
            city = city,
            forecast = groupedByDay,
            hourly = hourlyData 
        };


        return Ok(result);
        

    }
}