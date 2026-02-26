# STL Prime | Data Frontier

![STL Prime Logo](frontend/public/logo.svg)

**STL Prime** is a specialized marketplace for high-quality 3D printing files (STL and 3MF), developed by **Data Frontier**. Our mission is to bridge the gap between advanced engineering and the 3D printing community, providing optimized, tested, and high-performance models for enthusiasts and professionals.

## 🚀 Key Features

- **Tested Engineering:** Every premium model is printed and verified in our print farm to ensure geometry perfection.
- **3MF Optimization:** Ready-to-print profiles for Bambu Lab, Prusa, and Creality.
- **Data Frontier Identity:** Professional visual identity with a focus on precision and modern aesthetics.
- **Global Search:** Find gears, IoT cases, robotics components, and utilities specifically optimized for 3D printing.
- **Prime Membership:** Exclusive access to proprietary files, commercial resale rights, and filament discounts.

## 🛠️ Technology Stack

The project is built using modern web technologies:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with PostCSS
- **Icons:** [Lucide React](https://lucide.dev/)
- **Visuals:** Custom SVG branding and Glassmorphism effects
- **Typography:** Inter (Sans) and Outfit (Display)

## 🎨 Visual Identity

The project follows the official **Data Frontier** color palette:

- **Dark:** `#2B2B2B`
- **Blue:** `#3347FF`
- **Peach:** `#FFE3D6`
- **Rawhide:** `#B2624F`
- **Light BG:** `#F9F8F6`
- **White:** `#FFFFFF`

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Recommended version: 18.x or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd STL-Prime/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode
To run with Hot Reloading (auto-updates):
```bash
npm run dev
```

#### Production Mode (Recommended for Stability)
If you encounter CSS compilation issues or want a faster experience:
```bash
npm run build
npm run start
```
*Note: The server typically runs on [http://localhost:3000](http://localhost:3000).*

## 🧩 Project Structure

- `frontend/src/app`: Next.js pages and global layout.
- `frontend/src/components`: Reusable UI components.
- `frontend/public`: Static assets (logo, SVG icons).
- `frontend/tailwind.config.js`: Custom theme and color configurations.

## 🔧 Troubleshooting

- **Broken Layout:** If the page renders as plain text, ensure `postcss.config.js` exists and dependencies like `autoprefixer` are installed.
- **Favicon Cache:** If the browser tab icon doesn't update, clear your browser cache or open in Incognito/Private mode.
- **Port Conflict:** If port 3000 is in use, use `npm run dev -- -p <port_number>`.

---
*Developed with focus on engineering precision by Data Frontier.*
