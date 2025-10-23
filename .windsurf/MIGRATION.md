# Migration to .windsurf/rules

This project has migrated from `.windsurfrules` to the new `.windsurf/rules/` directory structure.

## New Structure

Rules are now organized in modular files:

```
.windsurf/rules/
├── README.md              # Index and overview
├── core-principles.md     # General development principles
├── nextjs.md             # Next.js 16 specific guidelines
├── typescript.md         # TypeScript best practices
├── react.md              # React patterns and hooks
├── tailwind.md           # Tailwind CSS guidelines
├── accessibility.md      # Accessibility (a11y) guidelines
├── database.md           # MongoDB and API design
└── security.md           # Security best practices
```

## Benefits

- **Modular**: Each domain has its own file
- **Maintainable**: Easier to update specific sections
- **Organized**: Better structure for large projects
- **Focused**: Find relevant rules quickly

## Note

The old `.windsurfrules` file is deprecated but kept for reference. All active rules are now in `.windsurf/rules/`.
