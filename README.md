# recoin

Open-source, local-first finance tracker. ⬛⬜

> This project is a work in progress and is not yet ready for production use.

## Project Structure

This project is a monorepo managed with Bun workspaces. It contains the following applications:

- `apps/api`: A backend API written in Go.
- `apps/site`: The frontend website built with Vite, TypeScript, Sass, and Retend.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- [Go](https://go.dev/) (for the API)

### Running the Site Locally

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Start the development server:**

   ```bash
   bun run site:dev
   ```

   This will start the Vite development server for the `apps/site` application, typically available at `http://localhost:5229`.

### Running the API Locally

1. **Start the API server:**

   ```bash
   bun run api:dev
   ```

   This command navigates to the `apps/api` directory and runs the Go application using `go run main.go`.
   _(Note: Ensure you have Go installed and configured correctly, and that the required environment variables are set in `apps/api/.env`.)_

### Running the API with Docker

1. **Build the Docker image:**

   ```bash
   docker build -t recoin-api .
   ```

2. **Run the container:**

   ```bash
   docker run -p 3000:3000 --env-file ./apps/api/.env recoin-api
   ```

   This will start the API server in a container, accessible at `http://localhost:3000`.

## Environment Variables

Both the API and the site rely on environment variables for configuration. These are typically managed using `.env` files.

### API (`apps/api`)

Create a `.env` file in the `apps/api` directory with the following variables:

- `SUPABASE_API_URL`: **Required**. The URL for your Supabase project API.
- `SUPABASE_SERVICE_ROLE_KEY`: **Required**. The service role key for your Supabase project.
- `PORT`: Optional. The port the API server will run on (defaults to `3000`).
- `FRONTEND_URL`: Optional. The URL of the frontend application, used for CORS configuration.

### Site (`apps/site`)

Create a `.env` file in the `apps/site` directory (or use `.env.development`, `.env.production`) with the following variable:

- `VITE_API_URL`: **Required**. The full URL where the backend API (`apps/api`) is running (e.g., `http://localhost:3000`).

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Create a new Pull Request.

## License

This project is licensed under the [MIT License](./LICENSE).
