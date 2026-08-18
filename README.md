# 📦 VaporCore — Internal Inventory & Recipe Database

A high-performance internal inventory management and search engine designed for rapid product cataloging, multi-flavor filtration, and raw ingredient stock tracking with built-in tablet/iPad optimization.

## 🚀 Key Features

- **Multi-Parametric Filter Engine**: Instant multi-tag flavor search, bottle size, nicotine strength (MG), and iced profile selectors.
- **Dual Database Architecture**: Seamlessly manage both finished retail product SKUs and concentrated raw aroma/ingredient stock.
- **iPad & POS Optimized**: Ergonomic 44px+ touch targets and fast one-tap stock adjustments (`+` / `-`).
- **Low Stock & Threshold Alerts**: Automated inventory status calculation with visual warning tags and stock counters.
- **Local Persistence & Export**: Offline-ready architecture utilizing client-side storage with one-click JSON backup export.

## 📁 Project Structure

```text
├── src/
│   ├── components/         # Modular UI components (modals, filters, cards, summary)
│   ├── data/               # Mock datasets and inventory seeding configuration
│   ├── types.ts            # TypeScript interfaces, types, and data models
│   ├── App.tsx             # Main dashboard layout and search/filter state engine
│   ├── main.tsx            # Application entry point
│   └── index.css           # Tailwind CSS directives and custom styling
├── index.html              # HTML shell with responsive meta and preloader
├── package.json            # Project dependencies and build scripts
└── vite.config.ts          # Vite build and development configuration