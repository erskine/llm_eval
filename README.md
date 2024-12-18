# LLM Evaluation Project

This project provides a platform for evaluating and comparing different Large Language Models (LLMs). It consists of:
- FastAPI backend service for running LLM experiments
- (Coming soon) React frontend for visualization and interaction

## Backend API Setup

### Prerequisites
- Python 3.11+
- Poetry (for dependency management)
- Valid API keys for supported LLM providers:
  - OpenAI
  - Anthropic
  - Google

### Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd llm-evaluation/backend
```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Add your API keys:
   ```
   OPENAI_API_KEY=<your openai api key>
   ANTHROPIC_API_KEY=<your anthropic api key>
   GOOGLE_API_KEY=<your google api key>
   ```

3. Install dependencies:
```bash
poetry install
```

4. Start the API server:
```bash
poetry run uvicorn api.v1.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at http://localhost:8000

### Development with VS Code

If using VS Code, you can utilize the provided devcontainer configuration:

1. Install the "Remote - Containers" extension
2. Open the project in VS Code
3. When prompted, click "Reopen in Container"
4. The container will build and start the API automatically

### API Documentation

Once running, view the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Running Tests

```bash
poetry run pytest
```

### API Endpoints

- `POST /v1/experiments/`: Run a new LLM comparison experiment
- `GET /v1/experiments/{experiment_id}`: Get results of a specific experiment
- `GET /v1/experiments/`: List all experiments

## Project Structure

```
backend/
├── api/
│   └── v1/
│       ├── main.py           # FastAPI application
│       ├── routers/
│       │   └── experiments.py # API endpoints
│       └── utils/
│           └── token_counter.py
├── persistence/
│   ├── base.py              # Database setup
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   └── crud.py             # Database operations
├── tests/
│   └── test_api.py         # API tests
├── pyproject.toml          # Poetry dependencies
└── .env.example           # Environment variables template
```

## Frontend (Coming Soon)

The frontend interface will provide:
- Interactive experiment configuration
- Results visualization
- Historical experiment comparison
- And more...

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.