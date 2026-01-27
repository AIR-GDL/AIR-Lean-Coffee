# Bun Migration - Reference Guide

## 📋 Migration Summary

The project has been migrated from npm to Bun as package manager and runtime.

### ✅ Changes Made

#### 1. **package.json scripts**
```json
{
  "scripts": {
    "dev": "bun --bun next dev --turbopack",
    "build": "bun --bun next build --turbopack",
    "start": "bun --bun next start",
    "lint": "bun --bun next lint"
  }
}
```

#### 2. **Lock Files**
- **Removed**: `package-lock.json` (backup saved as `package-lock.json.backup`)
- **Created**: `bun.lockb` (Bun's lock file)

#### 3. **Updated .gitignore**
```
# dependencies
/node_modules
/.pnp
.pnp.*
package-lock.json  # ← Added
bun.lockb          # ← Added
```

## 🚀 Usage Commands

### Development
```bash
bun run dev
```
Starts development server with Turbopack

### Build
```bash
bun run build
```
Builds the application for production

### Production
```bash
bun run start
```
Starts production server

### Linting
```bash
bun run lint
```
Runs ESLint

### Install dependencies
```bash
bun install
```
Installs all project dependencies

### Add new dependency
```bash
bun add <package-name>
```
Adds a new dependency

### Add dev dependency
```bash
bun add -d <package-name>
```
Adds a development dependency

## 📊 Benefits of Bun

- **⚡ Faster installation**: Up to 20x faster than npm
- **🔄 Compatible runtime**: 100% compatible with Node.js APIs
- **📦 Integrated bundler**: No need for webpack/rollup for certain cases
- **💾 Lower memory usage**: Optimized for low RAM consumption
- **🛠️ Built-in TypeScript**: No additional configuration needed

## 🔧 Technical Notes

### `--bun` flag
The `--bun` flag ensures Next.js uses Bun's runtime instead of Node.js:
```bash
bun --bun next dev
```

### Compatibility
- ✅ Next.js 16.0.7 - Fully compatible
- ✅ React 19.2.0 - No changes needed
- ✅ TypeScript 5 - Native support
- ✅ Tailwind CSS 4 - No changes needed
- ✅ MongoDB/Mongoose - Fully compatible

### Turbopack
Turbopack usage is maintained for development and build:
```bash
bun --bun next dev --turbopack
bun --bun next build --turbopack
```

## 🚨 Considerations

1. **Vercel deployment**: Vercel will use Node.js runtime by default, but this doesn't affect functionality
2. **Environment variables**: No changes, work the same way
3. **Custom scripts**: If you add new scripts, use `bun --bun` for Next.js commands

## 📝 Useful Commands

### Check Bun version
```bash
bun --version
```

### Update Bun
```bash
bun upgrade
```

### Clear cache
```bash
bun pmcache rm
```

### Run specific package
```bash
bunx <package>
```

## 🔄 Rollback (if needed)

If you need to go back to npm:
1. Delete `bun.lockb`
2. Restore `package-lock.json.backup` → `package-lock.json`
3. Revert scripts in package.json
4. Run `npm install`

---
**Migration date**: January 27, 2025  
**Bun version**: 1.3.6  
**Next.js version**: 16.0.7
