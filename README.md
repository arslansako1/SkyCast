# SkyCast — Weather App

🚀 **Live Demo:** https://skycast-virid.vercel.app.vercel.app

A full-stack weather application that provides current conditions, multi-day forecasts, saved favorite cities, and an intelligent Trip Planner for any destination worldwide. Built with ASP.NET Core and React, with in-memory caching and per-IP rate limiting to protect the external weather API.

---

## Features

### Weather
- **Current weather** — temperature, feels-like, description, and icon for any city
- **Multi-day forecast** — up to 10 days of daily aggregated data (average temp, humidity, wind speed)
- **Hourly forecast** — next 24 hours in detail
- **City search** — weather for any city in the world

### Favorite Cities
- Save cities for one-click access
- Per-user favorites that persist across sessions
- Quick weather check without re-searching

### Trip Planner
- Search any country and pick a trip style:
  - 🏖 **Beach** — warm, sunny, low rain
  - ⛸ **Ice Skating** — cold, snowy, stable conditions
  - 💼 **Business** — mild, dry, low wind
  - And more
- Get the **best day to go** and the **worst day to avoid** based on real forecast data
- See a 5-day forecast for the destination

### Authentication & Roles
- **User signup / login** — JWT-based authentication
- **Admin signup / login** — separate admin role
- **User features:** favorites, profile editing, weather search, trip planning
- **Admin features:** view, edit, and delete user accounts

### Performance & Protection
- **In-memory caching** — responses cached for 10 minutes per city to reduce API calls
- **Rate limiting** — 60 requests per minute per IP to prevent abuse
- **Custom attributes** — `[Cache]` and `[RateLimit]` implemented as ASP.NET Core action filters

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core 10 |
| External API | OpenWeatherMap |
| HTTP Client | Typed `HttpClient` via DI |
| Caching | In-memory (`ConcurrentDictionary`) |
| Rate Limiting | Sliding window, per-IP |
| Frontend | React (Vite) |
| Styling | CSS |
| Database | PostgreSQL 15 (Neon) |
| Auth | JWT + ASP.NET Identity |
| Containerization | Docker + Docker Compose |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |
| Database Hosting | Neon |

---

## Architecture

```
┌──────────────────────────────────────────┐
│  Frontend (React + Vite)                 │
│  Deployed on Vercel                      │
└──────────────────┬───────────────────────┘
                   │ HTTPS (JWT in header)
                   ▼
┌──────────────────────────────────────────┐
│  Backend (ASP.NET Core Web API)          │
│  Deployed on Render (Docker container)   │
│                                          │
│  ├── Controllers                         │
│  │   ├── AuthController                  │
│  │   ├── WeatherController               │
│  │   ├── FavoritesController             │
│  │   ├── AdminController                 │
│  │   └── ...                             │
│  ├── Attributes                          │
│  │   ├── CacheAttribute (IActionFilter)  │
│  │   └── RateLimitAttribute (IActionFilter)│
│  ├── Services                            │
│  │   ├── CacheService                    │
│  │   ├── RateLimiterService              │
│  │   ├── WeatherService                  │
│  │   └── TokenService                    │
│  └── HttpClient → OpenWeatherMap API     │
└──────────────────┬───────────────────────┘
                   │ Npgsql
                   ▼
┌──────────────────────────────────────────┐
│  PostgreSQL 15                           │
│  Managed on Neon                         │
│  (Users, Roles, Favorites)               │
└──────────────────────────────────────────┘
```

---

## Key Design Decisions

### Custom caching via attributes

The `[Cache(10)]` attribute runs as an `IActionFilter`:

- **Before the action** — checks if a cached response exists for the request (key = controller + action + query params). If yes, short-circuits and returns the cached data.
- **After the action** — if no cache existed, stores the fresh response for 10 minutes.

**Why:** Caching at the attribute level means any controller method can opt into caching with a single line. No manual cache management in business logic.

**Storage:** `ConcurrentDictionary` — thread-safe, in-memory. Not persisted across restarts, which is fine for a cache.

### Rate limiting per IP

The `[RateLimit(60, 60)]` attribute uses a sliding window:

- On each request, records the timestamp.
- Removes timestamps older than the window.
- If the count exceeds the limit, returns `429 Too Many Requests` with a `Retry-After` header.

**Why:** Prevents a single client from abusing the OpenWeatherMap API, which has its own rate limit on our side.

**Storage:** `ConcurrentDictionary<string, List<DateTime>>` keyed by IP. Thread-safe via lock.

### JWT claims — the tricky part

Getting role-based authorization to work across ASP.NET Core required matching claim names between where they're written and where they're read:

- **TokenService** writes `ClaimTypes.Role` and `ClaimTypes.NameIdentifier` (long-form URLs).
- **Program.cs** sets `RoleClaimType = ClaimTypes.Role` and `NameClaimType = ClaimTypes.NameIdentifier`.
- **`MapInboundClaims = false`** prevents ASP.NET from silently renaming claims during validation.

Without these three aligned, `[Authorize(Roles = "Admin")]` returns 403 even with a valid token.

---

## How To Run Locally

### Prerequisites
- Docker Desktop (for the database)
- .NET SDK 10
- Node.js 20+
- OpenWeatherMap API key (free tier) — [sign up here](https://openweathermap.org/api)

### 1. Add your API key

In `Backend/appsettings.Development.json`:

```json
{
  "WeatherApi": {
    "Key": "your-actual-api-key"
  }
}
```

### 2. Start the database

```bash
docker-compose up postgres -d
```

### 3. Run the backend

```bash
cd Backend
dotnet restore
dotnet build
dotnet run
```

Backend runs on `http://localhost:5275` (or whatever port ASP.NET picks — check the terminal).

### 4. Run the frontend

```bash
cd Fronted-react
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 5. Open the app

```
http://localhost:5173
```

Sign up as a user, or sign up as admin to manage accounts.

---

## API Endpoints

### Weather
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/weather/GetCurrentWeather?city=London` | ✅ |
| GET | `/api/weather/GetForecast?city=London&days=5` | ✅ |

### Auth
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/signup` | ❌ |
| POST | `/api/auth/login` | ❌ |
| POST | `/api/auth/signupAdmin` | ❌ (requires secret key) |
| POST | `/api/auth/forgetPassword` | ❌ |
| POST | `/api/auth/resetPassword` | ❌ |
| POST | `/api/auth/refreshToken` | ❌ |

### Favorites
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/favorites/getFavorites` | ✅ |
| POST | `/api/favorites/addFavorite` | ✅ |
| DELETE | `/api/favorites/deleteFavorite/{city}` | ✅ |

### Admin
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/admin/getAllUsers` | ✅ Admin only |
| GET | `/api/admin/getUser/{id}` | ✅ Admin only |
| PUT | `/api/admin/updateUser/{id}` | ✅ Admin only |
| PUT | `/api/admin/deleteUser/{id}` | ✅ Admin only |

---

## Environment Variables

### Backend (`.env` or Render dashboard)

| Variable | Description |
|---|---|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string |
| `JwtSettings__Key` | JWT signing key (32+ chars) |
| `JwtSettings__Issuer` | JWT issuer |
| `JwtSettings__Audience` | JWT audience |
| `WeatherApi__Key` | OpenWeatherMap API key |
| `EmailSettings__SmtpHost` | SMTP host |
| `EmailSettings__SmtpPort` | SMTP port |
| `EmailSettings__SmtpUsername` | SMTP username |
| `EmailSettings__SmtpPassword` | SMTP password / app password |
| `EmailSettings__FromEmail` | Sender email |
| `EmailSettings__FromName` | Sender display name |
| `AdminSettings__SecretKey` | Admin signup secret |
| `AllowedOrigins__0`, `__1`, ... | CORS allowed origins |
| `ASPNETCORE_ENVIRONMENT` | `Production` in prod |

### Frontend (`.env` or Vercel dashboard)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

**Note:** Secrets are never committed. `appsettings.json` contains placeholders only; real values live in `appsettings.Development.json` (gitignored) or platform environment variables.

---

## Project Structure

```
SkyCast-latest/
├── Backend/
│   ├── Attributes/
│   │   ├── CacheAttribute.cs
│   │   └── RateLimitAttribute.cs
│   ├── Controllers/
│   ├── Services/
│   │   ├── CacheService.cs
│   │   ├── RateLimiterService.cs
│   │   ├── TokenService.cs
│   │   └── EmailService.cs
│   ├── Program.cs
│   ├── appsettings.json
│   └── Dockerfile
├── Fronted-react/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vercel.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Testing Cache And Rate Limiting

### Test caching

```bash
# First request — cache miss
curl "http://localhost:5275/api/weather/GetCurrentWeather?city=London" \
  -H "Authorization: Bearer <token>"

# Second request within 10 min — cache hit
curl "http://localhost:5275/api/weather/GetCurrentWeather?city=London" \
  -H "Authorization: Bearer <token>"
```

Backend logs should show `CACHE MISS` on the first request and `CACHE HIT` on the second.

### Test rate limiting

```bash
for i in {1..61}; do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" \
    "http://localhost:5275/api/weather/GetCurrentWeather?city=London" \
    -H "Authorization: Bearer <token>"
done
```

Expected: requests 1–60 return `200`, request 61 returns `429`.

---

## Deployment

- **Backend:** Render (Docker container, auto-deploy from `main`)
- **Frontend:** Vercel (auto-deploy from `main`)
- **Database:** Neon-managed PostgreSQL

Every push to `main` triggers automatic redeployment.

---

## Project Status

- ✅ **Complete:** Auth (user + admin), weather, favorites, trip planner, caching, rate limiting, JWT roles, CORS
- ⚠️ **Partial:** Trip planner scoring is a simple heuristic — not a full itinerary planner
- 🚧 **Planned:** Extended forecasts, weather alerts, multi-day trip planning

---

## Known Limitations

- In-memory cache resets on backend restart. For production scale, use Redis.
- In-memory rate limiter resets on restart. For multi-instance deployments, use a shared store.
- Render free tier: backend sleeps after 15 minutes of inactivity — first request takes 30–60 seconds.

---

## License

MIT