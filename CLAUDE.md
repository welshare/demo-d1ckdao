# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React 19 + TypeScript + Vite application with the React Compiler enabled. The React Compiler is a new experimental feature that optimizes React component rendering.

## Commands

- **Development server**: `pnpm dev` - Starts Vite dev server with HMR
- **Build**: `pnpm build` - Type-checks with TypeScript (`tsc -b`) then builds with Vite
- **Lint**: `pnpm lint` - Runs ESLint on all files
- **Preview**: `pnpm preview` - Preview production build locally

## Architecture

### Build System
- **Vite 7** as build tool with HMR support
- **React Compiler** (babel-plugin-react-compiler) enabled in vite.config.ts for automatic memoization optimizations
- TypeScript project references: `tsconfig.app.json` for app code, `tsconfig.node.json` for build config

### ESLint Configuration
- Uses flat config format (`eslint.config.js`)
- Configured with TypeScript ESLint, React Hooks rules, and React Refresh plugin
- Global ignores for `dist/` directory

### Entry Points
- `index.html` - Vite entry point with root div
- `src/main.tsx` - React app bootstrap with StrictMode
- `src/App.tsx` - Main application component

## Important Notes

- The React Compiler is enabled, which impacts dev and build performance but provides automatic optimizations
- Package manager is **pnpm** (see `pnpm-lock.yaml`)
- React 19.1.1 is used with latest features
