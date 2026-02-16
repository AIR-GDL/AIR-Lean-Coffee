# Lean Coffee

Web application for Lean Coffee meetings with real-time timer, voting, multi-user synchronization and data analysis.

## ✨ Features

- 🎯 **Kanban board** with drag-and-drop for topic management
- ⏱️ **Synchronized timer** in real-time for all participants
- 🗳️ **Voting system** with 3 votes per user and visual feedback
- 📊 **Reports and analytics** with D3.js visualizations
- 🔄 **Live synchronization** with Pusher for multi-user updates
- 📱 **Responsive design** with collapsible sidebar and full accessibility
- 🗂️ **Discussion history** and archiving system
- 🐛 **Bug reporting system** integrated
- 📈 **Analytics** for discussions and participation

## 📚 Documentation

- **[`CHANGELOG.md`](./CHANGELOG.md)** - Version change history
- **[`docs/README-APP.md`](./docs/README-APP.md)** - Complete application documentation
- **[`docs/TESTING-GUIDE.md`](./docs/TESTING-GUIDE.md)** - Testing guide
- **[`docs/LOADER_USAGE.md`](./docs/LOADER_USAGE.md)** - Loading system guide

See [`docs/README.md`](./docs/README.md) for the complete documentation index in the `docs/` folder.

## 🚀 Getting Started

This project uses **Bun** as the default package manager and runtime.

First, install the dependencies:

```bash
bun install
```

Then, run the development server:

```bash
bun run dev
# or
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **UI**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Real-time**: [Pusher](https://pusher.com/)
- **Visualization**: [D3.js](https://d3js.org/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Deployment

### Required Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017/lean-coffee
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster
```

### Production Build

```bash
bun run build
bun start

# Alternative with npm:
npm run build
npm start
```

## 👥 Contributors

- **[Carlos Diaz](https://github.com/cardiadev)** (@cardiadev) - Lead Developer & Architecture

## 📄 License

This project is owned by Improving and distributed under internal license.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
