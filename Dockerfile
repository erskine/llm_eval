FROM mcr.microsoft.com/vscode/devcontainers/python:3.11

# Install additional OS packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    build-essential \
    supervisor

# Install Poetry
ENV POETRY_HOME=/opt/poetry
RUN curl -sSL https://install.python-poetry.org | python3 - \
    && ln -s /opt/poetry/bin/poetry /usr/local/bin/poetry

# Configure Poetry to create virtual environment inside project directory
RUN poetry config virtualenvs.in-project true

# Set working directory
WORKDIR /app

# Copy poetry files
COPY pyproject.toml poetry.lock* ./

# Install dependencies
RUN poetry install --no-root

# Copy the rest of the application
COPY . .

# Make start.sh executable
RUN chmod +x start.sh

# Add virtual environment to PATH
ENV PATH="/app/.venv/bin:$PATH"

#