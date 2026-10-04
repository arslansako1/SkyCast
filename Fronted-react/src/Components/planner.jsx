import { useRef, useState } from "react";
import { API_ENDPOINTS } from "../Config/Urls";
import { Link } from "react-router-dom";

export default function Planner() {
  const [searchInput, setSearchInput] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPlanned, setIsPlanned] = useState(false);
  const [bestDay, setBestDay] = useState(null);
  const [worstDay, setWorstDay] = useState(null);
  const [cityName, setCityName] = useState(false);
  const [selectedTripType, setSelectedTripType] = useState(false);
  const [weatherMessage, setWeatherMessage] = useState("");
  const hasFetched = useRef(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSearchInput = async (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.getCountries(value));
      const data = await response.json();
      setSearchSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Failed to fetch countries", error);
    }
  };

  const handlePlanTrip = async (e) => {
    e.preventDefault();

    const cityName = searchInput.trim();
    const selectedTrip = document.querySelector(
      "input[name='tripType']:checked",
    );

    setCityName(false);
    setSelectedTripType(false);

    if (!cityName) {
      setCityName(true);
    }

    if (!selectedTrip) {
      setSelectedTripType(true);
      return;
    }

    const tripType = selectedTrip.value;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.forcast(cityName), {});
      if (!response.ok) {
        console.log("Failed to fetch forecast");
        setError("Status: ", response.status);
        throw new Error("Failed to fetch forecast");
      }

      const data = await response.json();

      const scoredDays = data.forecast.map((day) => {
        let score = 0;

        if (tripType === "beach") {
          if (day.temp >= 25 && day.temp <= 30) {score += 10; setWeatherMessage("The weather is consistent throughout your trip!")} else{setWeatherMessage("This is the best day in the next 5 days")};
          if (
            day.description?.includes("sunny") ||
            day.description?.includes("clear")
          )
            score += 10;;
          if (day.description?.includes("rain")) score -= 10;
          if (day.windSpeed > 30) score -= 5;
          if (day.temp > 35) score -= 10;
          if (day.temp < 20) score -= 5;

        } else if (tripType === "tourism") {
          if (day.temp >= 15 && day.temp <= 25) {score += 10; setWeatherMessage("The weather is consistent throughout your trip!")} else{setWeatherMessage("This is the best day in the next 5 days")};
          if (!day.description?.includes("rain")) score += 10;
          if (day.description?.includes("clear")) score += 5;
          if (day.temp > 30) score -= 5;
          if (day.temp < 10) score -= 5;

        } else if (tripType === "business") {
          if (!day.description?.includes("rain")) {score += 10; setWeatherMessage("The weather is consistent throughout your trip!")} else{setWeatherMessage("This is the best day in the next 5 days")};
          if (day.temp >= 15 && day.temp <= 25) score += 10;
          if (
            !day.description?.includes("storm") &&
            !day.description?.includes("thunder")
          )
            score += 5;
          if (day.windSpeed > 40) score -= 5;
        } else if (tripType === "winter") {
          if (day.temp < 10){score += 10; setWeatherMessage("The weather is consistent throughout your trip!")} else{setWeatherMessage("There isn't any cold days in the next 5 days")} ;
          if (day.description?.includes("snow")){ score += 10; setWeatherMessage("The weather is consistent throughout your trip!")} else{setWeatherMessage("There isn't any cold days in the next 5 days")};
          if (day.temp > 15){ score -= 10; setWeatherMessage("The weather is consistent throughout your trip!")} else{setWeatherMessage("There isn't any cold days in the next 5 days")};
          if (day.description?.includes("rain")){ score -= 5; setWeatherMessage("The weather is consistent throughout your trip!")} else{setWeatherMessage("There isn't any cold days in the next 5 days")};
        }

        return { ...day, score};
      });

      const best = scoredDays.reduce((max, day) =>
        day.score > max.score ? day : max,
      );

      const worst = scoredDays.reduce((min, day) =>
        day.score < min.score ? day : min,
      );
       
    
        if (best.score === worst.score) {
        setBestDay(best);
        setWorstDay(null);
      } else {
        setBestDay(best);
       setWorstDay(worst);
      }
        



      setIsPlanned(true);

      console.log("Going into the foreach...");
    } catch (error) {
      console.error("Forecast error: ", error);
      setError(error.message || "Forecast error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchInput.trim()) {
      setSearchLoading(true);
      hasFetched.current = false;
      setCity(searchInput.trim());
      setSearchInput("");
      setShowSuggestions(false);
    }
  };

  const handleProfileClick = (e) => {
    const token = localStorage.getItem("token");
    if (token) {
      e.preventDefault();
      window.location.href = "/profile";
      return;
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      <button className="profile-btn" onClick={handleProfileClick}>
        Profile
      </button>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      <form onSubmit={handlePlanTrip}>
        <div className="planner">
          <h1>Plan your perfect trip</h1>
          <input
            type="search"
            placeholder="Search for a city..."
            value={searchInput}
            onChange={handleSearchInput}
          />

          {showSuggestions && searchSuggestions.length > 0 && (
            <ul className="suggestions-list2">
              {searchSuggestions.map((city, index) => (
                <li
                  key={`${city.id || city.name}-${index}`}
                  onClick={() => {
                    setCity(city.name);
                    setSearchInput(city.name);
                    setShowSuggestions(false);
                    hasFetched.current = false;
                  }}
                >
                  {city.name},{city.country}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="planner-container">
          <div className="radio-group">
            <div className="beach">
              <input type="radio" name="tripType" value="beach" id="beach" />
              <label htmlFor="beach">🏖️ Beach</label>
            </div>

            <div className="tourism">
              <input
                type="radio"
                name="tripType"
                value="tourism"
                id="tourism"
              />
              <label htmlFor="tourism">🏛️ Tourism</label>
            </div>

            <div className="business">
              <input
                type="radio"
                name="tripType"
                value="business"
                id="business"
              />
              <label htmlFor="business">💼 Business</label>
            </div>

            <div className="winter">
              <input type="radio" name="tripType" value="winter" id="winter" />
              <label htmlFor="winter">⛸️ Winter</label>
            </div>
          </div>
        </div>

        <button className="planner-submit" type="submit">
          Plan
        </button>

        {cityName && <p className="error">Please enter a city</p>}
        {selectedTripType && <p className="error">Please select a trip type</p>}
      </form>
     {isPlanned && bestDay && (
    <div className="trip-results">
        {worstDay && bestDay.score !== worstDay.score ? (
            <>
                <div className="best-day">
                    <h3>Best Day</h3>
                    <p>Date: {formatDate(bestDay.date)}</p>
                    <p>Temperature: {bestDay.temp}</p>
                    <p>Description: {bestDay.description}</p>
                    <p>WindSpeed: {bestDay.windSpeed}</p>
                    <p>Score: {bestDay.score}</p>
                </div>
                <div className="worst-day">
                    <h3>Worst Day</h3>
                    <p>Date: {formatDate(worstDay.date)}</p>
                    <p>temperature: {worstDay.temp}</p>
                    <p>Description: {worstDay.description}</p>
                    <p>WindSpeed: {worstDay.windSpeed}</p>
                    <p>Score: {worstDay.score}</p>
                </div>
            </>
        ) : (
            <div className="best-day full-width">
                <h3>Best Day</h3>
                  <p>Date: {formatDate(bestDay.date)}</p>
                  <p>Temperature: {bestDay.temp}</p>
                  <p>Description: {bestDay.description}</p>
                  <p>WindSpeed: {bestDay.windSpeed}</p>
                  <p>Score: {bestDay.score}</p>
                <p className="weather-note">{weatherMessage}</p>
            </div>
        )}
    </div>
)}
      <div className="signup-link">
        <Link to="/dashboard">back to dashboard</Link>
      </div>

      <p className="mark2">© 2026 SkyCast</p>
    </>
  );
}
