FROM mcr.microsoft.com/vscode/devcontainers/python:3.11

# Install additional OS packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    build-essential

# Install Poetry
ENV POETRY_HOME=/opt/poetry
RUN pip install poetry && \
    poetry config virtualenvs.in-project true

WORKDIR /app

# Copy only what's needed for dependency installation
COPY pyproject.toml poetry.lock* ./

# Copy the rest of the application
COPY . .

# Install dependencies and project
RUN poetry install

ENV PYTHONUNBUFFERED=1
ENV WATCHFILES_FORCE_POLLING=true

# Run FastAPI with uvicorn
CMD ["poetry", "run", "uvicorn", "api.v1.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]