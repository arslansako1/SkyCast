using System.Text.Json.Serialization;

public class WeatherMain
{
    [JsonPropertyName("temp")]
    public decimal Temp { get; set; }

    [JsonPropertyName("feels_like")]
    public decimal FeelsLike { get; set; }
}