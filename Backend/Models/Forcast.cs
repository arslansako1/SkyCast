using System.Text.Json.Serialization;

public class ForecastResponse
{
    [JsonPropertyName("list")]
    public List<ForecastItem>? List { get; set; }
}

public class ForecastItem
{
    [JsonPropertyName("dt_txt")]
    public string? DtTxt { get; set; }

    [JsonPropertyName("main")]
    public ForecastMain? Main { get; set; }

    [JsonPropertyName("weather")]
    public WeatherInfo[]? Weather { get; set; }

    [JsonPropertyName("wind")]
    public WindInfo? Wind { get; set; }
}

public class ForecastMain
{
    [JsonPropertyName("temp")]
    public decimal Temp { get; set; }

    [JsonPropertyName("feels_like")]
    public decimal FeelsLike { get; set; }

    [JsonPropertyName("humidity")]
    public int Humidity { get; set; }
}

public class WindInfo
{
    [JsonPropertyName("speed")]
    public decimal Speed { get; set; }
}

public class ForecastDay
{
    public DateTime Date { get; set; }
    public decimal Temp { get; set; }
    public decimal FeelsLike { get; set; }
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int Humidity { get; set; }
    public decimal WindSpeed { get; set; }
}