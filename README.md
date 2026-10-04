# SkyCast — Weather App

A full-stack weather application that provides current conditions and multi-day forecasts for any city worldwide. Built with ASP.NET Core and React, with caching and rate limiting to protect the external weather API.

---

## Features

- **Current weather** — temperature, feels-like, description, and icon for any city
- **Multi-day forecast** — up to 10 days of daily aggregated data (average temp, humidity, wind speed)
- **Hourly forecast** — next 24 hours in detail
- **In-memory caching** — responses cached for 10 minutes per city to reduce API calls
- **Rate limiting** — 60 requests per minute per IP to prevent abuse
- **Custom attributes** — `[Cache]` and `[RateLimit]` implemented as ASP.NET Core action filters


## How To Run
backend:
dotnet build
dotnet run

frontend:
npm install
npm run dev