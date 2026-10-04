import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./style.css";
import { API_ENDPOINTS } from "../Config/Urls";
import Popup from "./popup";
import DangerAlert from "./dangerAlert";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [city, setCity] = useState("Loading location");
  const [searchInput, setSearchInput] = useState("");
  const [unit, setUnit] = useState("C");
  const [favorites, setFavorites] = useState([]);
  const [selectedFavorite, setSelectedFavorite] = useState("");
  const [cityTime, setCityTime] = useState(new Date());
  const [viewMode, setViewMode] = useState("today");
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [dangerMessage, setDangerMessage] = useState("");
  const [isDangerOpen, setIsDangerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    const loadFavorites = async () => {
      setError("");
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.getFavorite, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (!response.ok) {
          console.log("Failed to fetch favorite cities");
          setError("Failed to fetch favorite cities");
          return;
        }

        const data = await response.json();

        const cityNames = data.map((fc) => fc.cityName);
        setFavorites(cityNames);
      } catch (error) {
        console.error("Failed to fetch favorite cities", error);
        setError(error.message);
        return;
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (cityTime) {
        const newTime = new Date(cityTime.getTime() + 1000);
        setCityTime(newTime);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cityTime]);

  useEffect(() => {
    if (city && city !== "Loading location" && !hasFetched.current) {
      hasFetched.current = true;
      fetchWeather(city);
      fetchForecast(city);
    }
  }, [city]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Location: ", latitude, longitude);

          getCityFromCoords(latitude, longitude);
        },
        (error) => {
          console.log("Could not get location: ", error.message);
          setCity("jordan");
          fetchWeather("jordan");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 6000,
        },
      );
    } else {
      setCity("jordan");
      fetchWeather("jordan");
    }
  }, []);

  const getCityFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
      );

      const data = await response.json();

      console.log("Location data: ", data);

      const cityName =
        data.address?.city ||
        data.address?.town ||
        data.address?.city.village ||
        data.address?.city.county ||
        "jordan";

      console.log("Your city: ", cityName);

      setCity(cityName);
      fetchWeather(cityName);
    } catch (error) {
      console.log("Failed to get your city: ", error);
      setCity("jordan");
      fetchWeather("jordan");
    }
  };

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");

    const headers = {};
    if (token) {
      headers.authorization = "Bearer " + token;
    }

    try {
      const response = await fetch(API_ENDPOINTS.weather(cityName), {
        headers: headers,
      });

      if (!response.ok) {
        throw new Error("City not found");
      }

      const data = await response.json();
      setWeather(data);

      if (data.timezone !== undefined) {
        const offsetSeconds = data.timezone;
        const now = new Date();
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
        const cityTime = new Date(utcTime + offsetSeconds * 1000);
        setCityTime(cityTime);
        console.log(`${cityName} time: `, cityTime.toLocaleTimeString());
      }
    } catch (error) {
      console.error("Weather error", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const fetchForecast = async (cityName) => {
    setLoadingForecast(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.forcast(cityName), {});
      if (!response.ok) {
        console.log("Failed to fetch forecast");
        setError("Status: ", response.status);
        throw new Error("Failed to fetch forecast");
      }

      const data = await response.json();
 
      setForecastData(data);

       data.forecast.forEach((day, index) => {
    console.log(`📅 Day ${index + 1}:`, {
      date: day.date,
      description: day.description,
      icon: day.icon,
      temp: day.temp
    });
  });

      console.log("Going into the foreach...");

      if (data){
        data.forecast.forEach(day => {

          const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString("en-US", {
              weekday: "short",   
              month: "short",    
              day: "numeric",
             year: "numeric"
            });
          }

          const hottestDay = data.forecast.reduce((max, day) => 
            day.temp > max.temp ? day : max
          );

          const coldestDay = data.forecast.reduce((max, day) =>
            day.temp < max.temp ? day : max
          );

          const strongestWind = data.forecast.reduce((max, day) =>
            day.windSpeed > max.windSpeed ? day : max
          )  

          if (day.windSpeed > 50){
            console.log("An alert must show up");
            const formattedDate = formatDate(strongestWind.date);
            setDangerMessage(`Strong wind in ${cityName} warning in ${formattedDate}`);
            setIsDangerOpen(true);     
          }

          if (day.temp > 35){
            console.log("An alert must show up");
            const formattedDate = formatDate(hottestDay.date);
            setDangerMessage(`Extreme heat in ${cityName} warning in ${formattedDate}`);
            setIsDangerOpen(true);
          }

          if (day.temp < 10){
            console.log("An alert must show up");
            const formattedDate = formatDate(coldestDay.date);
            setDangerMessage(`Extreme cold in ${cityName} warning in ${formattedDate}`);
            setIsDangerOpen(true);
          }

          if (day.description?.includes("thunderstorm")){
            console.log("An alert must show up");
            setDangerMessage(`Storm in ${cityName} warning in ${formattedDate}`);
            setIsDangerOpen(true);
          }

          
        })
      }
    } catch (error) {
      console.error("Forecast error: ", error);
      setError(error.message || "Forecast error");
    } finally {
      setLoadingForecast(false);
    }
  };

  const getWeatherIcon = (iconCode) => {
    const icons = {
      "01d": "☀️",
      "01n": "🌙",
      "02d": "⛅",
      "02n": "☁️",
      "03d": "☁️",
      "03n": "☁️",
      "04d": "☁️",
      "04n": "☁️",
      "09d": "🌧️",
      "09n": "🌧️",
      "10d": "🌦️",
      "10n": "🌧️",
      "11d": "⛈️",
      "11n": "⛈️",
      "13d": "❄️",
      "13n": "❄️",
      "50d": "🌫️",
      "50n": "🌫️",
    };
    return icons[iconCode] || "🌤️";
  };

  const toggleUnit = () => {
    setUnit(unit === "C" ? "F" : "C");
  };

  const convertTemp = (celsius) => {
    if (celsius === undefined || celsius === null) return null;
    if (unit === "F") {
      return (celsius * 9) / 5 + 32;
    }
    return celsius;
  };

  const getUnitSymbol = () => {
    return unit === "F" ? "F" : "C";
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


  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleProfileClick = (e) => {
    const token = localStorage.getItem("token");
    if (token) {
      e.preventDefault();
      window.location.href = "/profile";
      return;
    }

    setPopupMessage("You must login to access this feature");
    setIsAlertOpen(true);
  };

  const handleAdminManagBtn = (e) => {
    e.preventDefault();
    window.location.href = "/usersManagement";
  };

  const addFavorite = async (e) => {
    console.log(API_ENDPOINTS.addFavorite);
    console.log("addFavorite loaded");

    if (e) e.preventDefault();
    setError("");

    const cityName = weather?.city || city;

    if (!cityName) {
      setIsAlertOpen(true);
      setPopupMessage(`No city found`);
      return;
    }

    if (favorites.includes(cityName)) {
      console.log(`${cityName} is already in favorites, popup should appear`);
      setPopupMessage(`${cityName} is already in favorites`);
      setIsAlertOpen(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setIsAlertOpen(true);
      setPopupMessage("You must login to access this feature");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.addFavorite, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ CityName: cityName }),
      });

      if (!response.ok) {
        console.log("Failed to add favorite city");
        setError("Fetch failed");
        return;
      }

      const data = await response.json();

      setFavorites([...favorites, cityName]);
      setSelectedFavorite(cityName);
      setIsAlertOpen(true);
      setPopupMessage(`${cityName} added to favorites`);
    } catch (error) {
      console.error("Error adding city to favorites", error);
    }
  };

  const removeFavorite = async (cityToRemove) => {
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in first");
      setPopupMessage("You must login first to access this feature");
      setIsAlertOpen(true);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.deleteFavorite(cityToRemove), {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!response.ok) {
        console.log("Failed to remove city from favorites");
        setError("Failed to remove city from favorites");
        return;
      }

      const updatedFavorites = favorites.filter((fc) => fc !== cityToRemove);
      setFavorites(updatedFavorites);

      if (selectedFavorite === cityToRemove) {
        setSelectedFavorite("");
      }
    } catch (error) {
      console.error("Failed to remove city from favorites", error);
      setError(error.message || "Failed to remove city from favorites");
      return;
    }
  };

  const handleSignup = async () => {
    window.location.href = "/signup";
  };

  const handleLogin = async () => {
    window.location.href = "/login";
  };

  
  const handlePlannerClick = (e) => {
    const token = localStorage.getItem("token");
    if (token) {
      e.preventDefault();
      window.location.href = "/Planner";
      return;
    }

    setPopupMessage("You must login to access this feature");
    setIsAlertOpen(true);
  };

  const isAdmin = user?.roles?.includes("Admin");

  return (
    <>
      <div>
        {!localStorage.getItem("token") ? (
          <>
            <button className="signup1-btn" onClick={handleSignup}>
              Signup
            </button>
            <button className="login1-btn" onClick={handleLogin}>
              Login
            </button>
          </>
        ) : (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>

      <div>
        <button className="profile-btn" onClick={handleProfileClick}>
          Profile
        </button>
      </div>



      <div className="dashboard-container">
        <div className="header">
          <h1>SkyCast</h1>
        </div>

        <div className="time-section">
          <h3>Current time in {city}</h3>
          <p>{cityTime.toLocaleTimeString()}</p>
        </div>

        <form className="search-section" onSubmit={handleSearch}>
          <div className="search-wrapper">
  <input
    type="search"
    placeholder="Search for a city..."
    value={searchInput}
    onChange={handleSearchInput}

  />

  {showSuggestions && searchSuggestions.length > 0 && (
    <ul className="suggestions-list">
      {searchSuggestions.map((city, index) => (
        <li
          key={`${city.id || city.name}-${index}`}
          onClick={() => {
            setCity(city.name);
            setSearchInput(city.name);
            setShowSuggestions(false);
            hasFetched.current = false;
            fetchWeather(city.name);
            fetchForecast(city.name);
          }}
        >
          {city.name},
          {city.country}
        </li>
      ))}
    </ul>
  )}
</div>

          <button type="submit">
            {searchLoading ? "Loading..." : "Search"}
          </button>

          <div className="favorites-section">
            <button
              className="favorites-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Favorite cities {isDropdownOpen ? "▲" : "▼"}
            </button>

            {isDropdownOpen && (
              <div className="favortites-below">
                {favorites.length === 0 ? (
                  <div>No favorites yet</div>
                ) : (
                  favorites.map((favCity) => (
                    <div key={favCity}>
                      <span
                        onClick={() => {
                          setCity(favCity);
                          setSelectedFavorite(favCity);
                          setIsDropdownOpen(false);
                          hasFetched.current = false;
                        }}
                      >
                        {favCity}
                      </span>
                      <button
                        className="favorites-x"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFavorite(favCity);
                          setPopupMessage(
                            `Are you sure you want to remove ${favCity} from favorites?`,
                          );
                          setIsConfirmOpen(true);
                          setIsDropdownOpen(false);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </form>

        <div className="favorite-btn">
          <button onClick={addFavorite}>Add favorite</button>
        </div>

        <div className="weather-section">
          <div className="weather-options">
            <button onClick={() => setViewMode("today")}>Today</button>
            <button onClick={() => setViewMode("hourly")}>Hourly</button>
            <button onClick={() => setViewMode("10day")}>10-Day</button>
          </div>
          <h3>Weather in {weather?.city || "Loading..."}</h3>

          {loading && <p>Loading weather...</p>}

          {error && <p className="error">{error}</p>}

          {viewMode === "today" && weather && !loading && !error && (
            <div>
              <p className="temp">
                {Math.round(convertTemp(weather.temp))}°{getUnitSymbol()}
                {getWeatherIcon(weather.icon)}
              </p>

              <p className="desc">{weather.description}</p>
              <p className="feels-like">
                Feels like: {Math.round(convertTemp(weather.feelsLike))}°
                {getUnitSymbol()}
              </p>
              <button className="switch" onClick={toggleUnit}>
                Switch to {unit === "C" ? "F" : "C"}
              </button>
            </div>
          )}
          {viewMode === "hourly" && forecastData?.hourly && (
            <div className="hourly-forecast">
              <h4>Hourly Forecast</h4>
              <div className="hourly-grid">
                {forecastData.hourly.slice(0, 24).map((hour, index) => {
                  const time = new Date(hour.time);
                  const timeStr = time.toLocaleTimeString("en-US", {
                    hour: "numeric",
                  });
                  return (
                    <div key={index} className="hourly-item">
                      <div className="hourly-time">{timeStr}</div>
                      <div className="hourly-icon">
                        {getWeatherIcon(hour.icon)}
                      </div>
                      <div className="hourly-temp">
                        {Math.round(convertTemp(hour.temp))}°{getUnitSymbol()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {viewMode === "10day" && forecastData?.forecast && (
          <div className="ten-day-forecast">
            <h4>5 days Forecast:</h4>
            <div className="ten-day-list">
              {forecastData.forecast.slice(0, 10).map((day, index) => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString("en-US", {
                  weekday: "short",
                });
                const dateStr = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                return (
                  <div key={index} className="ten-day-item">
                    <div className="ten-day-date">
                      <div>{dayName}</div>
                      <div className="ten-day-date-str">{dateStr}</div>
                    </div>
                    <div className="ten-day-icon">
                      {getWeatherIcon(day.icon)}
                    </div>
                    <div className="ten-day-temp">
                      <div className="ten-day-high">
                        {Math.round(convertTemp(day.temp))}°{getUnitSymbol()}
                      </div>
                      <div className="ten-day-feels">
                        Feels: {Math.round(convertTemp(day.feelsLike))}°
                        {getUnitSymbol()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {isAdmin && (
          <div className="admin-panel">
            <button onClick={handleAdminManagBtn}>Users management</button>
          </div>
        )}
        <p className="mark">© 2026 SkyCast</p>
      </div>

      {isAlertOpen && (
        <Popup
          message={popupMessage}
          onClose={() => setIsAlertOpen(false)}
          type="alert"
        />
      )}

      {isConfirmOpen && (
        <Popup
          message={popupMessage}
          onConfirm={() => {
            removeFavorite(selectedFavorite);
            setIsConfirmOpen(false);
          }}
          onCancel={() => setIsConfirmOpen(false)}
          type="confirm"
        />
      )}
        {isDangerOpen && (
        <DangerAlert
          message={dangerMessage}
          onClose={() => setIsDangerOpen(false)}
        />
      )}

      <button className="planner-btn" onClick={handlePlannerClick}>Plan your next trip</button>

    </>
  );
}
