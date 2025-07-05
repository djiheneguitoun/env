# Floor Plan Editor

A React + TypeScript application for creating, editing, and visualizing floor plans. Users can design 2D floor plans and view them in an interactive 3D environment, featuring real-time editing of walls, doors, and windows. Built with Vite, Tailwind CSS, and Three.js for fast, modern, and visually engaging architectural prototyping.

## Features

- **2D Floor Plan Editor:** Easily design and modify floor layouts using an intuitive editor.
- **3D Visualization:** Instantly view your floor plans in 3D for a more immersive experience.
- **Interactive Elements:** Add and edit walls, doors, and windows with real-time feedback.
- **Modern Tech Stack:** Powered by React, TypeScript, Vite, Tailwind CSS, and Three.js.
- **Responsive Design:** Works well on both desktop and modern mobile browsers.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or above recommended)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/djiheneguitoun/env.git
   cd env
   ```

2. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```

3. Start the development server:
   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view the app in your browser.

## Project Structure

- `src/` — Main source code
  - `components/` — React components (2D editor, 3D viewer, UI elements)
  - `contexts/` — State management for the floor plan
  - `index.css` — Tailwind CSS setup
- `public/` — Static assets and HTML template
- `vite.config.ts` — Vite configuration
- `tailwind.config.js` — Tailwind CSS configuration

## Technologies Used

- **React** & **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Three.js** (via `@react-three/fiber` and `@react-three/drei`)

## License

This project is licensed under the MIT License.

---
