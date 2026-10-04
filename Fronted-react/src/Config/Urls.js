
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5275";
const WEATHER_API_KEY = "646c8cea7c7fcdab2f3c11e9e0d9addb";

export const API_ENDPOINTS = {
    login: `${API_URL}/api/auth/login`,
    signup: `${API_URL}/api/auth/signup`,
    adminSignup: `${API_URL}/api/auth/signupAdmin`,
    weather: (cityName) => `${API_URL}/api/weather/getCurrentWeather?city=${cityName}`,
    forcast: (city, days = 5) => `${API_URL}/api/weather/GetForecast?city=${city}&days=${days}`,
    getMe: `${API_URL}/api/users/getMe`,
    updateMe: `${API_URL}/api/users/updateMe`,
    getAllUsers: `${API_URL}/api/admin/getAllUsers`,
    deleteUser: `${API_URL}/api/admin/deleteUser`,
    getUser: `${API_URL}/api/admin/getUser`,
    updateUser: `${API_URL}/api/admin/updateUser`,
    forgetPassword: `${API_URL}/api/auth/forgetPassword`,
    resetPassword: `${API_URL}/api/auth/resetPassword`,
    addFavorite: `${API_URL}/api/favorites/addFavorites`,
    getFavorite: `${API_URL}/api/favorites/getFavorites`,
    deleteFavorite: (cityName) => `${API_URL}/api/favorites/deleteFavorite?cityName=${cityName}`,
    getCountries: (query) => `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${WEATHER_API_KEY}`
};

