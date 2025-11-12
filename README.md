# Vendora AI Vendor Analyst

A React-based vendor analysis application built with Vite, TypeScript, and Supabase.

## Project info

**URL**: https://lovable.dev/projects/af3940c8-e9cf-4b82-8532-e38c6b6c1d94

## Local Development Setup

Follow these steps to set up the application for local development:

### Prerequisites

- **Docker & Docker Compose** - [Install Docker](https://docs.docker.com/get-docker/)

### Step-by-Step Setup

1. **Set up Supabase (local backend):**
   ```sh
   # Start the local Supabase stack
   docker compose -f supabase-docker/docker-compose.yml up -d
   ```
   
   This will start all Supabase services (database, auth, API, etc.) on your local machine.
   See `supabase-docker/README.md` for more details.

2. **Configure environment variables:**
   ```sh
   # Copy the example environment file
   cp env.dev.example .env.dev
   ```
   
   Edit `.env.dev` with your Supabase configuration:
   ```env
   VITE_SUPABASE_URL=http://localhost:8000
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
   ```
   
   **Get your Supabase anonymous key:**
   - Visit Supabase Studio at `http://your-ip-here:8000` (replace `your-ip-here` with your actual IP or use `localhost`)
   - **Chrome users**: If Chrome refuses to show Basic auth popup, first click here: http://supabase:this_password_is_insecure_and_should_be_updated@your-ip-here:8000/. The page won't work properly, but then navigate to http://your-ip-here:8000/ after that.
   - Go to Settings → API
   - Copy the `anon public` key

3. **Start the application:**
   ```sh
   # Build and start the React application
   docker-compose up --build
   ```

4. **Push database migrations:**
   ```sh
   # Apply all pending migrations to your local database
   PGSSLMODE=disable npx supabase db push --db-url "postgres://postgres.your-tenant-id:your-super-secret-and-long-postgres-password@localhost:6543/postgres"
   ```
   
   This command will apply all database schema migrations to your local Supabase instance.

5. **Access the application:**
   - **App**: http://localhost:8080
   - **Supabase Studio**: http://your-ip-here:8000

### Environment Configuration

**Environment File Priority:**
- `.env.dev` (highest priority - for development overrides, not tracked in git)
- `.env` (fallback - tracked in git and used in production)

The `.env.dev` file will override any values in `.env`, allowing you to customize your development environment without modifying the tracked `.env` file.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Production Deployment

Simply open [Lovable](https://lovable.dev/projects/af3940c8-e9cf-4b82-8532-e38c6b6c1d94) and click on Share → Publish.
