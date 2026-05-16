# Curalink — AI Medical Research Assistant

Curalink is a state-of-the-art AI-powered medical research assistant designed to deliver evidence-based clinical insights. By actively retrieving data from leading medical and academic repositories—including **PubMed**, **OpenAlex**, and **ClinicalTrials.gov**—it ensures accurate, up-to-date, and highly relevant responses for medical professionals, researchers, and students.

## 🚀 Key Features

- **Intelligent Medical Chat**: Conversational AI interface referencing real clinical trials and research papers.
- **Evidence-Based Grounding**: Automatically searches and references data from reliable medical databases.
- **Research Drawer**: A dedicated fly-out drawer to view in-depth details about cited papers and clinical trials, complete with metadata and links to original sources.
- **Dynamic Visuals & State Management**: Real-time fetching indicators and beautifully rendered message bubbles for a seamless chatter experience.
- **Modern Responsive UI**: Built with a mobile-first philosophy, adapting beautifully across desktops and mobile viewing environments.
- **Dark & Light Mode**: Built-in support for theme toggling to accommodate varying preferences and low-light environments.
- **High-Performance Infrastructure**: Lightning-fast builds, instant Hot Module Reloading (HMR), and optimized production bundles.

## 🛠️ Technology Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) with SWC for extremely fast development cycles
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI + Tailwind)
- **Data Fetching**: [React Query (TanStack Query)](https://tanstack.com/query/latest)
- **Routing**: [React Router](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: Framer Motion & standard Tailwind animations (`tailwindcss-animate`)
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)

## 🏗️ Project Structure

- `src/components/curalink/`: Contains domain-specific components (e.g., `MessageBubble`, `ResearchDrawer`, `Sidebar`, `FetchingIndicator`).
- `src/components/ui/`: Contains generic, reusable UI components built via shadcn/ui.
- `src/api/`: Manages external API interactions, data fetching logic, and connections to PubMed/OpenAlex (`chatApi.js`).
- `src/hooks/`: Custom React hooks (`use-mobile.tsx`, `use-toast.ts`).
- `src/lib/`: Utilities, mock data (`curalink-mock.ts`), and TypeScript type definitions (`curalink-types.ts`).
- `src/pages/`: Application views and routing pages (`Index.tsx`, `NotFound.tsx`).

## 💻 How to Run Locally

### Prerequisites

You need [Node.js](https://nodejs.org/) (version 18+) installed.

### Setup Steps

1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd curalink-ai-research
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   bun install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   # or
   bun run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to see the application running.

## 🧪 Testing

To execute the unit and integration tests setup with Vitest and React Testing Library:

```sh
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 📦 Building for Production

To build the project for a production environment:

```sh
npm run build
```

This will generate an optimized build in the `dist` folder. To preview the production build locally:

```sh
npm run preview
```
