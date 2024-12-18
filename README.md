# LLM Evaluation Platform

A comprehensive platform for evaluating and comparing different Large Language Models (LLMs). Compare responses, performance metrics, and costs across multiple LLM providers including OpenAI, Anthropic, and Google.

## Features

- Run experiments with multiple LLMs simultaneously
- Compare response quality, timing, and token usage
- Interactive web interface for experiment configuration
- Persistent storage of experiment results
- Support for system and user prompts
- Real-time result visualization

## Quick Start

### Option 1: Docker Compose (Recommended)

Prerequisites:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

1. Clone the repository:
```bash
git clonehttps://github.com/erskine/llm_eval.git
cd llm-eval
```

2. Set up environment variables:
```bash
cp backend/.env.example backend/.env
```

3. Add your API keys to `backend/.env`:
```
OPENAI_API_KEY=<your-key>
ANTHROPIC_API_KEY=<your-key>
GOOGLE_API_KEY=<your-key>
```

4. Start both services:
```bash
docker compose up
```

The application will be available at:
- Frontend UI: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Option 2: VS Code Dev Containers

1. Prerequisites:
   - [VS Code](https://code.visualstudio.com/) or [Cursor](https://www.cursor.com/)
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. Open the project in VS Code or Cursor:
```bash
cd llm_eval
code .
```

3. Choose your development environment:
   - For full-stack development: Open the root folder and select "Reopen in Container"
   - For backend-only: Open the `backend` folder and select "Reopen in Container"
   - For frontend-only: Open the `frontend` folder and select "Reopen in Container"

4. Configure environment variables as described above

### Option 3: Local Development

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
poetry install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Start the API server:
```bash
poetry run uvicorn api.v1.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
├── backend/                 # FastAPI backend service
│   ├── api/                # API endpoints and business logic
│   │   └── v1/
│   │       ├── main.py
│   │       ├── routers/
│   │       └── utils/
│   ├── persistence/        # Database models and operations
│   ├── tests/             # Backend tests
│   └── Dockerfile.dev     # Development container configuration
├── frontend/              # React/TypeScript frontend
│   ├── src/              # Frontend source code
│   │   ├── components/   # React components
│   │   ├── lib/         # Utility functions
│   │   └── types/       # TypeScript type definitions
│   └── Dockerfile.dev    # Development container configuration
├── docker-compose.yml    # Multi-container Docker configuration
└── .devcontainer/        # VS Code Dev Container configuration
```

## Development

### Backend (FastAPI)

- Built with Python 3.11 and FastAPI
- Uses Poetry for dependency management
- SQLite database for persistence
- Automatic API documentation with Swagger UI

Run tests:
```bash
cd backend
poetry run pytest
```

### Frontend (React)

- Built with React 18, TypeScript, and Vite
- Uses ShadcnUI components
- Tailwind CSS for styling

Available commands:
```bash
cd frontend
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
```

## API Documentation

When running, access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.