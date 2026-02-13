# Contributing

Thanks for your interest in contributing to vue-excalidraw!

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18

## Setup

```bash
git clone https://github.com/alsey89/vue-excalidraw.git
cd vue-excalidraw
npm install
```

## Development

```bash
# Build all packages
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint
npm run lint

# Format
npm run format

# Type check
npm run typecheck
```

## Project Structure

```
packages/
  core/     # vue-excalidraw — Vue 3 component, composable, Vite plugin
  nuxt/     # vue-excalidraw-nuxt — Nuxt 3 module wrapper
```

The Nuxt module depends on the core package. npm workspaces links them automatically during development.

## Submitting Changes

1. Fork the repository and create a branch from `main`
2. Make your changes
3. Ensure all checks pass: `npm run lint && npm run format:check && npm run typecheck && npm run build && npm test`
4. Write a clear PR description explaining what changed and why
5. Submit your pull request

## Code Style

This project uses ESLint and Prettier. Run `npm run lint:fix && npm run format` before committing to ensure consistent formatting.

## Reporting Issues

Use [GitHub Issues](https://github.com/alsey89/vue-excalidraw/issues) to report bugs or request features.
