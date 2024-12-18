FROM mcr.microsoft.com/vscode/devcontainers/python:3.11

# Install additional OS packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    build-essential
    
    
ENV PYTHONUNBUFFERED=1
ENV WATCHFILES_FORCE_POLLING=true

# Install Poetry
ENV POETRY_HOME=/opt/poetry
RUN pip install poetry && \
    poetry config virtualenvs.in-project true

# Set working directory
WORKDIR /workspaces/${localWorkspaceFolderBasename} 