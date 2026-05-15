# Gemini Project Context: payment-tracker-app

## Project Overview

`payment-tracker-app` is a monorepo designed for a payment tracking application. It is structured as a pnpm workspace with a Preact-based frontend and an Express-based backend.

## Architecture & Structure

The project uses a monorepo structure managed by **pnpm**.

- **`frontend/`**: A Preact application powered by Vite and TypeScript.
  - **`src/assets/`**: Images, icons, and global styles.
  - **`src/components/`**: Reusable UI components.
  - **`src/hooks/`**: Custom Preact hooks.
  - **`src/pages/`**: View components for specific routes.
  - **`src/services/`**: API calls and shared business logic.
- **`backend/`**: Express.js server focused on simplicity.
  - **`src/middleware/`**: Express middlewares (Auth, Error handling).
  - **`src/models/`**: Data schemas and types.
  - **`src/routes/`**: API endpoint definitions and their logic.
  - **`src/utils/`**: Shared utility classes and functions (e.g., ApiError).

## Technology Stack

- **Package Manager**: pnpm (Workspaces)
- **Frontend Framework**: [Preact](https://preactjs.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (using the `@tailwindcss/vite` plugin)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Linting**: [ESLint 9](https://eslint.org/) (Flat Config) with `typescript-eslint` and `eslint-plugin-react`.
- **Formatting**: [Prettier](https://prettier.io/) for consistent code style.

## Development Workflows

### Environment Setup

1.  Ensure [pnpm](https://pnpm.io/) is installed.
2.  Install dependencies from the root:
    ```bash
    pnpm install
    ```

### Common Commands

- **Frontend Development**: Run the dev server.
  ```bash
  pnpm --filter @app/frontend dev
  ```
- **Backend Development**: Run the API server in watch mode.
  ```bash
  pnpm --filter @app/backend dev
  ```
- **Build Frontend**: Production build.
  ```bash
  pnpm --filter @app/frontend build
  ```
- **Linting**: Run ESLint across the entire workspace.
  ```bash
  pnpm eslint .
  ```
- **Formatting**: Format all files in the workspace.
  ```bash
  pnpm format
  ```

## Engineering Standards & Conventions

### Linting & Code Style

- Use **ESLint 9 Flat Config** (`eslint.config.mts`).
- The project uses the **modern JSX transform**, so importing `React` or `h` in every file is not required.
- **Preact-Specifics**: Use `class` instead of `className` (standard in Preact, though `className` is supported for compatibility). The linter is configured to allow `class`.
- Hardcode the React version to `16.0` in ESLint settings to maintain compatibility with Preact's API surface while using `eslint-plugin-react`.

### Component Structure

- Prefer functional components and hooks.
- Organize code by type (Components, Pages, Services) for simplicity.

### Styling

- Use Tailwind CSS utility classes.
- Global styles are located in `frontend/src/index.css`.

### Git Configuration

- A single `.gitignore` file is maintained at the project root for the entire workspace. Do not add per-package `.gitignore` files.
