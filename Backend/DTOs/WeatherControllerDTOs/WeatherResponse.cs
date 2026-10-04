
using System.Text.Json.Serialization;

public class WeatherResponse
{
    [JsonPropertyName("main")]
    public WeatherMain? Main { get; set; }

    [JsonPropertyName("weather")]
    public WeatherInfo[]? Weather { get; set; }
    public int Timezone { get; internal set; }
}
