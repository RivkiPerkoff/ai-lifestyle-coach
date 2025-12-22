# AI Lifestyle Coach - Frontend

React TypeScript frontend for the AI Lifestyle Coach application.

## Features

- Modern React with TypeScript
- Authentication flow
- Onboarding questionnaire
- Dashboard with AI-generated plans
- Responsive design

## Setup

### Prerequisites
- Node.js 18+
- Backend API running

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Environment Variables

Create `.env.local`:
```env
REACT_APP_API_URL=http://localhost:5000
```

### Available Scripts

```bash
# Development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Project Structure

```
src/
├── components/    # Reusable UI components
├── pages/        # Route components
├── hooks/        # Custom React hooks
├── services/     # API communication
├── types/        # TypeScript definitions
├── utils/        # Helper functions
└── App.tsx       # Main application
```

## User Flow

1. **Authentication** - Login/Register
2. **Onboarding** - Complete profile questionnaire
3. **Dashboard** - View AI-generated daily plan
4. **Calendar Integration** - Sync with Google Calendar

## Components

- `Login/Register` - Authentication forms
- `Onboarding` - Multi-step profile setup
- `Dashboard` - Main application interface
- `PlanView` - Display daily wellness events