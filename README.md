# AI Lifestyle Coach

A personalized daily wellness planner powered by AI that integrates with Google Calendar.

## Project Overview

AI Lifestyle Coach creates personalized daily wellness plans based on user preferences, BMI, and lifestyle habits. The system uses Gemini AI to generate customized recommendations and automatically integrates them into the user's Google Calendar.

## Features

- **Personalized Onboarding**: Smart questionnaire to understand user needs
- **AI-Powered Planning**: Custom daily schedules using Gemini API
- **Google Calendar Integration**: Automatic event creation and scheduling
- **Modular Wellness Components**:
  - Nutrition recommendations
  - Hydration reminders
  - Movement breaks
  - Sleep optimization
  - Digital wellness
  - Mindfulness moments

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **AI**: Google Gemini API
- **Integration**: Google Calendar API
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd ai-lifestyle-coach

# Run with Docker
docker-compose up --build

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## Project Structure

```
ai-lifestyle-coach/
├── frontend/          # React application
├── backend/           # Node.js API server
├── docker-compose.yml # Container orchestration
├── .github/workflows/ # CI/CD pipelines
└── docs/             # Documentation
```

## Development Setup

See individual README files in `frontend/` and `backend/` directories for detailed setup instructions.