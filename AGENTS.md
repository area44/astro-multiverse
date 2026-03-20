# Astro Multiverse Agent Guidelines

This document provides instructions and context for AI agents working on this project.

## Project Overview

Astro Multiverse is a re-implementation of the classic Multiverse template from HTML5 UP using modern web technologies. It eliminates legacy dependencies like jQuery and Poptrox in favor of a clean, React-based implementation.

## Tech Stack

- **Astro 6**: Project structure, SSG, and routing.
- **React 19**: Gallery components and Lightbox implementation.
- **Tailwind CSS v4**: Utility-first styling integrated via Vite plugin.
- **Oxlint & Oxfmt**: Fast linting and formatting.

## Key Implementation Details

### Lightbox Component

- **Location**: `src/components/Gallery.tsx`
- **Portals**: Uses `createPortal` to render the lightbox directly into `document.body`. This avoids stacking context issues and the blur filter applied to `#wrapper`.
- **Styling**: Replicates legacy CSS classes (`.poptrox-overlay`, `.poptrox-popup`, `.pic`, `.closer`, `.nav-previous`, `.nav-next`, `.loader`) to maintain the original look and feel while using modern CSS.
- **Responsiveness**: The lightbox is responsive. On screens <= 736px, navigation controls are optimized and image sizing changes to maximize screen usage.

### Styles

- **Global Styles**: Located in `src/styles/global.css`.
- **Tailwind v4**: Uses the new `@import "tailwindcss";` syntax. Custom theme variables are defined in the `@theme` block.
- **Is-Preload**: The `is-preload` class on `body` is used for initial loading animations.

### Images

- Images are stored in `src/assets`.
- Thumbnails and full-size images are optimized using Astro's image processing capabilities.

## Development Workflow

### Scripts

- `pnpm dev`: Start the development server on port 4321.
- `pnpm build`: Build the project for production.
- `pnpm lint`: Run Oxlint to find and fix issues.
- `pnpm format`: Run Oxfmt to format code.
- `pnpm check`: Run both linting and formatting checks.

### Guidelines

- **No Legacy JS**: Do not re-introduce jQuery or Poptrox. Use React for interactive elements.
- **Optimization**: Always use Astro's `Image` component or `getImage` service for assets.
- **Cleanliness**: Do not add log files or build artifacts to the repository. Ensure they are covered by `.gitignore`.
