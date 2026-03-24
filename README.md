# Orivia

![Landing Page](img/landing_page.png)

Orivia is a modern travel platform designed to help users plan their trips and book open trip packages. It is built with a microservice architecture to ensure scalability and separation of concerns.

- **Frontend**: A responsive user interface built with **React** and **Vite**
- **Backend Gateway**: A central authentication and proxy service using **Django REST Framework**
- **Travel Planner Microservice**: **FastAPI** service for creating and managing travel itineraries
- **Open Trip System Microservice**: **FastAPI** service for managing bookable open trip packages

## Architecture Overview

The system consists of a frontend application that communicates with a central Django gateway. This gateway handles user authentication and intelligently routes requests to the appropriate backend microservice.

![System Architecture](img/system_architecture.png)

### Default Ports

| Service          | URL (Local)             |
| ---------------- | ----------------------- |
| Frontend (Vite)  | `http://127.0.0.1:5173` |
| Django Gateway   | `http://127.0.0.1:8000` |
| Travel Planner   | `http://127.0.0.1:8001` |
| Open Trip System | `http://127.0.0.1:8002` |

## Microservice Repositories

| Service              | Repository URL                                           |
| -------------------- | -------------------------------------------------------- |
| Travel Planner       | [https://github.com/dzakyatha/travel_planner.git](https://github.com/dzakyatha/travel_planner.git) |
| Open Trip System     | [https://github.com/NakeishaValya/open-trip-system.git](https://github.com/NakeishaValya/open-trip-system.git) |

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+**
- **Node.js** (LTS version recommended)
- **Git**
- **PostgreSQL** (Recommended for full-featured setup)
- (Optional) **Docker Desktop** for running Redis.

This project uses `uv` for fast Python package and virtual environment management. Install it globally:

```powershell
pip install uv
```

## Local Development Setup

Follow these steps to run the entire stack on your local machine. It's recommended to run each service in a separate terminal.

### 1. Travel Planner Microservice (FastAPI)

This service manages user-created travel plans.

```powershell
# Navigate to the service directory
cd travel_planner

# Create a virtual environment and install dependencies
uv sync

# Create a .env file from the example
Copy-Item .env.example .env -Force
```

**Configure `travel_planner/.env`:**
For local development, it's recommended to use PostgreSQL.

```env
# SECRET_KEY can be any random string for local dev
SECRET_KEY=your-super-secret-key
# Example for a local PostgreSQL database
DATABASE_URL=postgresql://user:password@localhost:5432/travel_planner_db
```

**Run the service:**

```powershell
# The gateway expects this service on port 8001 by default
uv run uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

You can access the API documentation at `http://127.0.0.1:8001/docs`

### 2. Open Trip System Microservice (FastAPI)

This service manages available open trips.

```powershell
# Navigate to the service directory
cd open-trip-system

# Create a virtual environment and install dependencies
uv sync

# Create a .env file from the example
Copy-Item .env.example .env -Force
```

**Configure `open-trip-system/.env`:**
It's recommended to use PostgreSQL for local development.

```env
# SECRET_KEY can be any random string
SECRET_KEY=another-super-secret-key
# Example for a local PostgreSQL database
DATABASE_URL=postgresql://user:password@localhost:5432/open_trip_db
```

**Run the service:**

```powershell
# The gateway expects this service on port 8002 by default
uvicorn backend.main:app --host 127.0.0.1 --port 8002 --reload
```

API documentation is available at `http://127.0.0.1:8002/docs`

### 3. Backend Gateway (Django)

This is the main entry point for the frontend. It handles authentication and proxies requests to the microservices.

```powershell
# Navigate to the Django project
cd orivia/backend

# Create a virtual environment and install dependencies
uv sync

# Create a .env file
Copy-Item .env.example .env -Force
```

**Configure `orivia/backend/.env`:**
Set the database, microservice URLs, and Google OAuth credentials. For local development, it's recommended to use PostgreSQL.

```env
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# PostgreSQL Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=orivia_db
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microservice URLs (ensure ports match the running services)
TRAVEL_PLANNER_URL=http://127.0.0.1:8001
OPEN_TRIP_URL=http://127.0.0.1:8002
```

**Run database migrations and start the server:**

```powershell
uv run python manage.py makemigrations
uv run python manage.py migrate
uv run python manage.py runserver
```

**Running Redis for Caching**

The gateway uses Redis for caching to improve performance. You can run Redis locally using Docker.

```powershell
# From the orivia/backend directory
docker compose -f redis-docker-compose.yml up -d
```

Ensure your `orivia/backend/.env` file is configured to connect to Redis:

```env
# Redis Cache Configuration
REDIS_LOCATION=redis://127.0.0.1:6379/1
```

You can view the Redis instance using Redis Insight, which will be available at `http://localhost:5540`.

### 4. Frontend (React)

Finally, set up and run the user interface

```powershell
# Navigate to the frontend directory
cd orivia/frontend

# Install dependencies
npm install

# Create a .env file
Copy-Item .env.example .env -Force
```

**Configure `orivia/frontend/.env`:**
Ensure the API URL points to your Django gateway and add your Google Client ID

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

**Run the development server:**

```powershell
npm run dev
```

You can now access the Orivia application at `http://127.0.0.1:5173`

## Contributors
<p align="center">
  <table>
    <tbody>
      <tr>
        <td align="center" width="50%" valign="middle">
          <a href="https://github.com/dzakyatha">
            <img src="https://avatars.githubusercontent.com/u/164707111?v=4?s=100"
                 width="100"
                 style="border-radius:50%; object-fit:cover;" 
                 alt="dzakyatha"/>
            <br />
            <sub><b>dzakyatha</b></sub>
          </a>
        </td>
        <td align="center" width="50%" valign="middle">
          <a href="https://github.com/NakeishaValya">
            <img src="https://avatars.githubusercontent.com/u/167664928?v=4?s=100"
                 width="100"
                 style="border-radius:50%; object-fit:cover;" 
                 alt="NakeishaValya"/>
            <br />
            <sub><b>NakeishaValya</b></sub>
          </a>
        </td>
      </tr>
    </tbody>
  </table>
</p>