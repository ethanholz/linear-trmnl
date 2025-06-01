# linear-trmnl

A lightweight Deno-based API service that fetches and caches your assigned Linear issues, designed for [TRMNL](https://usetrmnl.com).

## Features

- 🚀 Fast API responses with intelligent caching
- 📊 Fetches your assigned Linear issues organized by state (Todo, Backlog)
- ⏰ Configurable auto-refresh intervals
- 🔄 Manual refresh endpoint
- 🏥 Health check endpoint with cache status
- 🐳 Docker support
- 📦 Zero-config setup with sensible defaults

## Quick Start

### Prerequisites

- [Deno](https://deno.land/) runtime (if not using Docker)
- [Docker](https://www.docker.com/) (if not using Source)
- [Linear API token](https://linear.app/docs/api-and-webhooks)

### Installation

#### Docker (Recommended)
1. Create a `.env` file with your Linear API token:
```bash
LINEAR_API_TOKEN=your_linear_api_token_here
# Add other options if needed
```

2. Run the service:
```bash
# Build the image
docker build -t linear-trmnl .

# Run the container
docker run -d \
  --name linear-trmnl \
  -p 8000:8000 \
  --env-file .env \
  linear-trmnl
```
The API will be available at `http://localhost:8000`

#### Source
1. Clone the repository:
```bash
git clone <repository-url>
cd linear-trmnl
```

2. Create a `.env` file with your Linear API token:
```bash
LINEAR_API_TOKEN=your_linear_api_token_here
# Add other options if needed
```

3. Run the service:
```bash
deno task start
```

## Configuration

Configure the service using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `LINEAR_API_TOKEN` | Your Linear API token (required) | - |
| `CACHE_DURATION_MINUTES` | How long to cache responses | `30` |
| `REFRESH_INTERVAL_MINUTES` | Background refresh interval | `15` |

### Getting a Linear API Token

1. Go to [Linear Settings > API](https://linear.app/settings/api)
2. Create a new personal API key
3. Copy the token to your `.env` file

## API Endpoints

### GET `/`

Returns your assigned Linear issues organized by state.

**Response:**
```json
{
  "issues": {
    "todo": [
      {
        "title": "Fix authentication bug",
        "description": "Users can't log in with OAuth",
        "project": "Authentication System"
      }
    ],
    "backlog": [
      {
        "title": "Add dark mode support",
        "description": "Implement dark theme toggle"
      }
    ]
  },
  "cached": true,
  "lastRefresh": "2024-01-15T10:30:00.000Z",
  "refreshIntervalMinutes": 15,
  "cacheDurationMinutes": 30
}
```

### POST `/refresh`

Manually refresh the issues cache.

**Response:**
```json
{
  "message": "Cache refreshed successfully",
  "lastRefresh": "2024-01-15T10:35:00.000Z",
  "issues": { ... }
}
```

### GET `/health`

Check service health and cache status.

**Response:**
```json
{
  "status": "healthy",
  "lastRefresh": "2024-01-15T10:30:00.000Z",
  "cacheAgeMinutes": 5,
  "isCacheValid": true,
  "refreshIntervalMinutes": 15,
  "cacheDurationMinutes": 30
}
```
