
using System.Text.Json.Serialization;

public class WeatherInfo
{
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("icon")]
    public string? Icon { get; set; }
}