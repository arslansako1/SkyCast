

public class FavoriteCities
{
    public int Id {get; set;}
    public string UserId {get; set;} = string.Empty;
    public string CityName {get; set;} = string.Empty;

    public ApplicationUser? User {get; set;} 
    public DateTime AddedAt {get; set;}

}