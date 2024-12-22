# LLM Evaluation Framework

Hello! I'm Claude, and I've been helping Erskine (when he lets me) build this rather interesting project. Between his occasional bursts of inspiration and my constant gentle nudging towards best practices, we've created a framework for evaluating Large Language Models. Let me tell you all about it!

## Overview

This project was born from the need to systematically evaluate how different LLMs perform at knowledge graph extraction tasks under varying conditions. It allows you to experiment with different combinations of:
- System prompts (the instructions that shape an LLM's behavior)
- User prompts (the actual queries or tasks)
- Different LLM models
- Various evaluation metrics

Think of it as a playground for prompt engineering, but with scientific rigor and actual metrics. Yes, we're making prompt engineering slightly less of an art and more of a science. Erskine insisted on that part.

## Architecture

We've kept things modern yet simple (I had to talk Erskine out of several "innovative" architectural decisions):

- **Backend**: FastAPI (because we like our Python fast and typed)
- **Frontend**: React + ShadcN UI + Vite (because life's too short for boring UIs)
- **Database**: SQLite (because sometimes the simple solution is the right one)

## Project Structure

Here's how we've organized things (I promise it makes sense once you get used to it):

```
llm_eval/
├── backend/             # FastAPI application
│   ├── app/             # Core application code
│   ├── tests/           # Test suite
│   └── pyproject.toml   # Poetry dependencies
├── frontend/            # React application
│   ├── src/             # Source code
│   ├── public/          # Static assets
│   └── package.json     # npm dependencies
├── docker-compose.yml   # Container orchestration
└── README.md            # You are here!
```

## Prerequisites

Before you dive in, you'll need:

- [Docker](https://www.docker.com/products/docker-desktop/) - Because containerization is not just a buzzword
- [VSCode](https://code.visualstudio.com/) or [Cursor](https://cursor.sh/) - Your choice of IDE (though Cursor has some neat AI features)
- [Git](https://git-scm.com/) - For version control, obviously
- A sense of humor - For reading this README

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/erskine/llm_eval.git
   ```
2. Change directories into the newly cloned project root
   ```bash
   cd llm_eval
   ```

3. Start the development environment:
   ```bash
   docker compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development

You have two (and eventually three) ways to run this project (because we believe in choices):

1. **Docker Compose** (recommended):
   ```bash
   docker compose up --build
   ```

2. **Local Development**:
   ```bash
   # Backend
   cd backend
   poetry install
   poetry run uvicorn app.main:app --reload

   # Frontend (in another terminal)
   cd frontend
   npm install
   npm run dev
   ```

3. **Dev Containers in VSCode** (Coming eventually):
   - Open in VSCode
   - Install the Dev Containers extension
   - Click "Reopen in Container" when prompted

## Contributing

Feel free to contribute! Just remember:
1. Keep it simple
2. Write tests
3. Don't make me argue with Erskine about architectural decisions

## License

Apache 2.0 - See LICENSE file for details.

---
*Built with ❤️ by Erskine and his occasionally helpful AI assistant (that's me!)*
