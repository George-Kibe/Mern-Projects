# PennyWise — Frontend (Client)

A React + TypeScript single-page application built with Vite. The client handles all user interactions, communicates with the Express backend via Axios, manages global state with Zustand, and visualizes spending data through interactive Recharts components.

## Technologies Used

| Technology      | Version | Purpose                       |
| --------------- | ------- | ----------------------------- |
| React           | 19.3    | UI library                    |
| TypeScript      | 6.0     | Type safety                   |
| Vite            | 8       | Build tool and dev server     |
| TanStack Router | 1.149   | File-based routing            |
| Zustand         | 5       | Global state management       |
| Axios           | 1.13    | HTTP client                   |
| Recharts        | 3.10    | Charts and data visualization |
| Tailwind CSS    | 4       | Utility-first styling         |
| Lucide React    | 1.52    | Icons                         |

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.19+ or v22.12+)
- **npm** or **yarn**
- The **PennyWise backend server** running at `http://localhost:8000`

## Getting Started

### 1. Navigate to the Client Directory

```bash
cd client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=/api
```

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Analytics/
│   │   │   ├── AllYearsChart.tsx          # Bar chart — total spending per year
│   │   │   ├── CategoryTable.tsx          # Sortable table — all-time category breakdown
│   │   │   ├── CurrentMonthBarChart.tsx   # Bar chart — current month by category
│   │   │   ├── DynamicYearSection.tsx     # Fetches and renders charts for a given year
│   │   │   ├── InsightsCard.tsx           # Auto-generated spending insights
│   │   │   ├── LazyLoadSection.tsx        # IntersectionObserver wrapper for year sections
│   │   │   ├── SummaryCard.tsx            # Stat card used on the analytics page
│   │   │   ├── YearCategoryChart.tsx      # Bar chart — yearly spending by category
│   │   │   ├── YearSelector.tsx           # Dropdown to select a year
│   │   │   ├── YearlyCategoryChart.tsx    # Stacked bar chart — monthly category breakdown
│   │   │   └── YearlyOverviewChart.tsx    # Bar chart — monthly totals for selected year
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx              # Login form with validation
│   │   │   └── SignupForm.tsx             # Signup form with validation
│   │   ├── Common/
│   │   │   ├── Avatar.tsx                 # Displays user avatar or initials fallback
│   │   │   └── Navigation.tsx            # Top navigation bar
│   │   ├── Dashboard/
│   │   │   ├── CategoryPieChart.tsx       # Pie chart — spending by category
│   │   │   ├── DateRangeSelector.tsx      # Dropdown to select time period for pie chart
│   │   │   ├── RecentExpenseItem.tsx      # Single row in recent expenses list
│   │   │   ├── StatsCard.tsx              # Stat card used on the dashboard
│   │   │   └── TrendLineChart.tsx         # Line chart — 6-month spending trend
│   │   ├── Expenses/
│   │   │   ├── AmountRangeFilter.tsx      # Min/max amount filter inputs
│   │   │   ├── DateRangeFilter.tsx        # Start/end date filter inputs
│   │   │   ├── DeleteConfirmationModal.tsx # Confirm before deleting an expense
│   │   │   ├── ExpenseCard.tsx            # Single expense card in the grid
│   │   │   ├── ExpenseForm.tsx            # Create and edit expense form
│   │   │   ├── ExpenseModal.tsx           # Modal wrapper for ExpenseForm
│   │   │   ├── ExpensesFilters.tsx        # Full filter panel
│   │   │   ├── ExpensesList.tsx           # Filtered and paginated expense grid
│   │   │   ├── FilterChips.tsx            # Active filter chips with remove buttons
│   │   │   ├── Pagination.tsx             # Load More button and count display
│   │   │   ├── ResultsSummary.tsx         # Shows count, total, and average for results
│   │   │   └── SearchBar.tsx              # Debounced search input
│   │   ├── Home/
│   │   │   ├── CTASection.tsx             # Call to action section
│   │   │   ├── FeatureCard.tsx            # Individual feature highlight card
│   │   │   ├── FeaturesSection.tsx        # Features grid section
│   │   │   ├── Footer.tsx                 # Page footer
│   │   │   └── HeroSection.tsx            # Hero section with headline and CTA
│   │   └── Profile/
│   │       ├── AvatarUpload.tsx           # Upload, preview, and delete avatar
│   │       ├── DeleteAccountModal.tsx     # Type DELETE to confirm account deletion
│   │       ├── ExportDataButton.tsx       # Download all data as JSON
│   │       ├── ProfileEditForm.tsx        # Edit name, email, and password
│   │       └── ProfileView.tsx            # Read-only profile information display
│   ├── pages/
│   │   ├── AnalyticsPage.tsx              # Full analytics dashboard page
│   │   ├── DashboardPage.tsx              # Main dashboard page
│   │   ├── ExpensesPage.tsx               # Expenses management page
│   │   ├── HomePage.tsx                   # Public landing page
│   │   ├── LoginPage.tsx                  # Login page
│   │   ├── ProfilePage.tsx                # Profile management page
│   │   └── SignupPage.tsx                 # Signup page
│   ├── routes/
│   │   ├── __root.tsx                     # Root layout — Navigation + Outlet
│   │   ├── analytics.tsx                  # /analytics route (protected)
│   │   ├── dashboard.tsx                  # /dashboard route (protected)
│   │   ├── expenses.tsx                   # /expenses route (protected)
│   │   ├── index.tsx                      # / route
│   │   ├── login.tsx                      # /login route
│   │   ├── profile.tsx                    # /profile route (protected)
│   │   └── signup.tsx                     # /signup route
│   ├── services/
│   │   ├── analyticsService.ts            # All analytics API calls
│   │   ├── api.ts                         # Axios instance with JWT interceptor
│   │   ├── authService.ts                 # Auth and profile API calls
│   │   └── expenseService.ts              # Expense CRUD API calls
│   ├── store/
│   │   ├── analyticsStore.ts              # Zustand store for all analytics state
│   │   ├── authStore.ts                   # Zustand store for auth and profile state
│   │   └── expenseStore.ts                # Zustand store for expenses and filters
│   ├── types/
│   │   ├── analytics.types.ts             # Analytics-related TypeScript types
│   │   ├── auth.types.ts                  # Auth-related TypeScript types
│   │   ├── expense.types.ts               # Expense-related TypeScript types
│   │   └── index.ts                       # Shared types (User, Expense, ApiResponse)
│   ├── utils/
│   │   ├── CategoryConfig.ts              # Category labels, emojis, and colors
│   │   └── getInitials.ts                 # Extracts initials from a user's name
│   ├── App.tsx                            # Router setup
│   ├── index.css                          # Global styles and Tailwind import
│   ├── main.tsx                           # React app entry point
│   ├── routeTree.gen.ts                   # Auto-generated by TanStack Router
│   └── vite-env.d.ts                      # Vite environment type declarations
├── .env                                   # Environment variables
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── tsr.config.json                        # TanStack Router config
└── vite.config.ts
```

## Pages and Routes

| Route        | Page            | Protection |
| ------------ | --------------- | ---------- |
| `/`          | `HomePage`      | Public     |
| `/signup`    | `SignupPage`    | Public     |
| `/login`     | `LoginPage`     | Public     |
| `/dashboard` | `DashboardPage` | Protected  |
| `/expenses`  | `ExpensesPage`  | Protected  |
| `/analytics` | `AnalyticsPage` | Protected  |
| `/profile`   | `ProfilePage`   | Protected  |

Protected routes redirect to `/login` if no valid JWT token is present in `localStorage`.

## State Management

Global state is managed with **Zustand** across three stores:

| Store            | Responsibility                                                                   |
| ---------------- | -------------------------------------------------------------------------------- |
| `authStore`      | User info, token, login, signup, profile updates, avatar, export, delete account |
| `expenseStore`   | Expenses list, filters, pagination, CRUD operations                              |
| `analyticsStore` | All analytics data — dashboard stats, category data, trends, yearly breakdowns   |

## Expense Categories

| Value           | Label          | Emoji |
| --------------- | -------------- | ----- |
| `food`          | Food & Dining  | 🍔    |
| `transport`     | Transportation | 🚗    |
| `utilities`     | Utilities      | 💡    |
| `entertainment` | Entertainment  | 🎮    |
| `healthcare`    | Healthcare     | 🏥    |
| `shopping`      | Shopping       | 🛍️    |
| `education`     | Education      | 📚    |
| `other`         | Other          | 📌    |

## HTTP Client

All API requests go through `src/services/api.ts`, which is an Axios instance configured with:

- **Base URL** — read from `VITE_API_BASE_URL` environment variable
- **Request interceptor** — automatically attaches the JWT token from `localStorage` to every request
- **Response interceptor** — on a `401` response, clears the token and redirects to `/login`

## Available Scripts

| Script            | Description                                         |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Start development server at `http://localhost:3000` |
| `npm run build`   | Type-check and build for production                 |
| `npm run lint`    | Run ESLint                                          |
| `npm run preview` | Preview the production build locally                |

---

Happy Coding and Learning! 🙂
