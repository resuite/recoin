# recoin

recoin is an open-source, local-first finance tracker designed to empower individuals to take control of their financial data. It is built with Go, Bun, Vite, Retend, and Supabase.

> This project is a work in progress and is not yet ready for production use.

## Project Structure

This project is a monorepo managed with workspaces, containing the following applications:

- `apps/api`: A backend API built with Go, responsible for data management and API endpoints.
- `apps/site`: The frontend website built with Vite, TypeScript, Sass, and Retend, providing the user interface.

## Getting Started

### Prerequisites

Ensure you have the following installed:

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

   This will launch the Vite development server for the `apps/site` application, typically accessible at `http://localhost:5229`.

### Running the API Locally

1. **Start the API server:**

   ```bash
   bun run api:dev
   ```

   This command navigates to the `apps/api` directory and runs the Go application using `go run main.go`. Ensure Go is correctly installed and configured.

## Environment Variables

The API and site rely on environment variables for configuration, managed via `.env` files.

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

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.
