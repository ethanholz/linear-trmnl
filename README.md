# linear-trmnl

A lightweight Deno-based API service that fetches and caches your assigned Linear issues, designed for [TRMNL](https://usetrmnl.com).

## Features

- 🚀 Fast API responses with simple caching
- 📊 Fetches your assigned Linear issues organized by state (Todo, Backlog)
- 🐳 Docker support
- 📦 Zero-config setup with sensible defaults

## Quick Start

### Prerequisites

- [Deno](https://deno.land/) runtime (if not using Docker)
- [Docker](https://www.docker.com/) (if not using Source)
- [Linear API token](https://linear.app/docs/api-and-webhooks)
- A generated API key see below:
```bash
openssl rand -base64 32
```

### Installation

#### Docker (Recommended)
1. Create a `.env` file with your Linear API token:
```bash
LINEAR_API_TOKEN=your_linear_api_token_here
API_KEY=your_api_key
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
API_KEY=your_api_key
# Add other options if needed
```

3. Run the service:
```bash
deno task start
```

### Deno Deploy
You can also deploy this on [Deno Deploy](https://deno.com/deploy). Use the methods described [here](https://docs.deno.com/deploy/manual/how-to-deploy/) and add your
`API_KEY` and `LINEAR_API_TOKEN` to the environment variables.


## Configuration

Configure the service using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `LINEAR_API_TOKEN` | Your Linear API token (required) | - |
| `API_KEY` | Your API key (required) | - |
### Getting a Linear API Token

1. Go to [Linear Settings > API](https://linear.app/settings/api)
2. Create a new personal API key
3. Copy the token to your `.env` file

## Using with TRMNL
Once your service is up, you will want to add it to TRMNL by setting this up as a Polling `GET`, set your `API_KEY` using the header `API-Key: your_key_here`. Then you can create markup as you wish!

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
        // Project is an optional field
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
}
```

### POST `/cache`

**Body:**
Refresh
```json
{"action":"refresh"}
```

Clear
```json
{"action":"clear"}
```

**Response:**
```json
{"message":"..."}
```
