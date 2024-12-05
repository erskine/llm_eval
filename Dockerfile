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

# Create service users and groups
RUN groupadd -r streamlit && \
    useradd -r -g streamlit -m streamlit && \
    mkdir -p /home/streamlit/.streamlit && \
    # Create and populate credentials.toml with default values
    echo '[general]\nemail = ""\n' > /home/streamlit/.streamlit/credentials.toml && \
    touch /home/streamlit/.streamlit/secrets.toml && \
    touch /home/streamlit/.streamlit/config.toml && \
    chown -R streamlit:streamlit /home/streamlit/.streamlit && \
    chmod -R 700 /home/streamlit/.streamlit && \
    groupadd -r uvicorn && \
    useradd -r -g uvicorn -m uvicorn && \
    # Add service users to vscode group for development
    usermod -a -G vscode streamlit && \
    usermod -a -G vscode uvicorn && \
    # Add vscode user to service groups for development
    usermod -a -G streamlit vscode && \
    usermod -a -G uvicorn vscode

# Set working directory
WORKDIR /app

# Copy poetry files
COPY pyproject.toml poetry.lock* ./

# Install dependencies
RUN poetry install --no-root

# Copy the rest of the application
COPY . .

# Set up permissions
RUN chmod +x start.sh && \
    chmod +x llm_eval/scripts/llm_eval.sh && \
    # Make app readable by all users
    chmod -R 755 /app && \
    # Make virtual environment accessible by all users
    chown -R root:root /app/.venv && \
    chmod -R 755 /app/.venv && \
    # Set specific ownership for streamlit config
    chown -R streamlit:streamlit /home/streamlit/.streamlit && \
    chmod -R 750 /home/streamlit/.streamlit && \
    # Ensure vscode user can access everything in dev mode
    mkdir -p /home/vscode/.streamlit && \
    chown -R vscode:vscode /home/vscode/.streamlit

# Set up supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Add virtual environment to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Create log directory with proper permissions
RUN mkdir -p /var/log/supervisor && \
    chown -R root:root /var/log/supervisor && \
    chmod -R 755 /var/log/supervisor

# Set environment variable for Streamlit home directory
ENV STREAMLIT_HOME_PATH=/home/streamlit/.streamlit

# Set supervisor as the entrypoint
ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Copy Streamlit config
COPY .streamlit/config.toml /home/streamlit/.streamlit/config.toml
RUN chown streamlit:streamlit /home/streamlit/.streamlit/config.toml && \
    chmod 600 /home/streamlit/.streamlit/config.toml

