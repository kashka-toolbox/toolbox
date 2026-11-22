# AGENTS.md

This file provides guidelines for agentic coding assistants working on this repository.

## Project Overview

Next.js 15 toolbox application with TypeScript, Tailwind CSS, Radix UI, and Zustand for state management. Client-side focused with PWA support.

## Commands

### Development
- `pnpm run dev` - Start development server (localhost:3000)
- `pnpm run build` - Production build
- `pnpm run build:full` - Full build with standalone server
- `pnpm start -p 3000` - Start production server

### Quality
- `pnpm run lint` - Run ESLint (next/core-web-vitals)

### Testing
- `pnpm run playwright-ui` - Run Playwright tests with UI
- `pnpm run playwright-ci` - Run Playwright tests in CI mode

### Single Test
Run a specific Playwright test:
```bash
pnpm exec playwright test tests/word-counter.spec.ts
```

With UI:
```bash
pnpm exec playwright test tests/word-counter.spec.ts --ui
```

## Code Style Guidelines

### Imports
- Use `@/*` path alias: `import { cn } from "@/lib/utils"`
- External imports grouped by source (react, third-party, internal)
- Sort imports alphabetically within groups

### File Naming
- Components: kebab-case (e.g., `word-counter/page.tsx`, `node-io.tsx`)
- Type definitions: PascalCase.type.ts (e.g., `Position.type.ts`)
- Library files: PascalCase (e.g., `NodeDefinition.ts`, `CreateNode.factory.ts`)
- Utility functions: kebab-case (e.g., `areTypesCompatible.ts`, `deepEqual.ts`)

### Component Structure
- Add `"use client"` directive at top for client components
- Named exports preferred: `export function ComponentName() { }`
- Default exports only for pages: `export default function Page() { }`
- Use `cn()` utility for conditional Tailwind classes

### TypeScript
- Use strict mode (enabled in tsconfig.json)
- Type parameters use descriptive names (I for inputs, O for outputs)
- Use `readonly` for React props: `{ readonly children: React.ReactNode }`
- Avoid `any`; use `unknown` or proper types
- Use JSDoc for complex types

### Naming Conventions
- Components: PascalCase (`Button`, `Node`, `Graph`)
- Functions/variables: camelCase (`getNodeState`, `isProcessing`)
- Types/interfaces: PascalCase (`NodeState`, `GraphState`)
- Constants: UPPER_SNAKE_CASE (`NODE_CATEGORIES`)
- Event handlers: `handle*` prefix (`handleMouseDown`, `handleMouseMove`)
- State setters: `set*` prefix (`setNodePosition`, `setBeingDragged`)

### State Management
- Use Zustand for complex state (e.g., graph state)
- Create context providers for Zustand stores
- Use hooks with selectors: `useGraphStore((state) => state.nodes)`
- State updates use immer-like patterns with spread operators

### Styling
- Use Tailwind CSS utility classes
- Leverage shadcn/ui components as base
- Use class-variance-authority (cva) for variant components
- Custom CSS in `src/styles/` when needed
- Dark mode via `next-themes` with class-based toggle

### Error Handling
- Try/catch with async/await for error-prone operations
- Log errors with `console.error()` including context
- Set error states in UI: `setNodeState(nodeId, { error: error.message })`
- Throw descriptive `Error` or `ReferenceError` objects
- Use `?.` optional chaining for potentially null values

### React Patterns
- Use `React.forwardRef` for components that need ref forwarding
- Set `displayName` on forwarded components
- Clean up event listeners in useEffect returns
- Use `useMemo`/`useCallback` for expensive computations
- Keep dependencies arrays complete in useEffect/hooks

### Internationalization
- Use `next-intl` for translations
- Access via `useTranslations()` hook: `const t = useTranslations('graph')`
- Translation keys use dot notation: `t('nodes.' + nodeState.name + '.name')`

### Hooks
- Custom hooks start with `use`: `useNodeState`, `useGraphStore`
- Accept generic types when appropriate: `useNodeState<R = NodeState<any, any>>`
- Return type inference preferred over explicit typing

### Graph System Conventions
- Node definitions use factory pattern: `createNode()`
- Edges connect `NodeIOIdentifier` objects
- Execute graph topologically from output nodes backward
- Use `isProcessing` flag during execution
- Store errors in node state for display

### Testing
- Playwright for E2E tests in `tests/` directory
- Use `test.describe()` for grouping related tests
- Tests use async/await pattern with `page` fixture
- Base URL: `http://localhost:3000`
- Screenshots on failure only
