---
trigger: always_on
---

# Rules Index

This directory contains modular development rules for the AIR Lean Coffee project.

## Available Rules

1. **core-principles.md** - General development principles, naming conventions, and project structure
2. **nextjs.md** - Next.js 16 App Router, Server/Client Components, routing, and API routes
3. **typescript.md** - TypeScript best practices, type safety, and component typing
4. **react.md** - React patterns, hooks, state management, and performance optimization
5. **tailwind.md** - Tailwind CSS utilities, responsive design, and styling patterns
6. **accessibility.md** - Accessibility (a11y) guidelines for inclusive web development
7. **database.md** - MongoDB integration, data models, and API design
8. **security.md** - Security best practices, authentication, and data protection

## How to Use

These rules guide the behavior of Windsurf Cascade AI assistant. The assistant will automatically reference these files when helping with development tasks.

## Tech Stack Summary

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **MongoDB**
- **ESLint**
- **MCP Servers** (next-devtools)

## Quick Reference

### File Organization
```
src/
├── app/              # App Router (pages, layouts, API)
├── components/       # Reusable components
├── hooks/           # Custom hooks
├── lib/             # Utilities & config
├── models/          # Data models
└── types/           # TypeScript types
```

### Always Remember
- Server Components by default
- Always use Tailwind for styling
- Type everything with TypeScript
- Build accessible interfaces
- Validate all inputs
- Handle errors gracefully
