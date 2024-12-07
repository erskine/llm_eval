# LLM Evaluation Project

## Project Structure
This project uses a containerized environment with two main services:
- FastAPI backend (running on port 8000)
- Streamlit frontend (running on port 8501)

## Development Setup

### Prerequisites
- Docker
- VS Code with Remote Containers extension

### Getting Started
1. Clone the repository

2. Set up environment variables:
   - Create a `.env` file in the project root
   - Copy the contents from `.env.example`
   - Replace the placeholder values with your actual API keys:
   ```
   OPENAI_API_KEY=<your openai api key>
   ANTHROPIC_API_KEY=<your anthropic api key>
   GOOGLE_API_KEY=<your google api key>
   ```
   Note: Keep your `.env` file private and never commit it to version control.

3. Open the project in VS Code

4. When prompted, click "Reopen in Container"
   - The container will build and start both services automatically
   - The Streamlit UI will be available at http://localhost:8501
   - The FastAPI backend will be available at http://localhost:8000

## Using the Application

1. Open the Streamlit UI in your browser (http://localhost:8501)
2. Enter your desired:
   - System prompt
   - User prompt
   - Select the models you want to compare
3. Click "Run Experiment" to see the results

## Container Architecture

### User Permissions
The container uses three different users for security and isolation:
- `streamlit`: Runs the Streamlit frontend service
- `uvicorn`: Runs the FastAPI backend service
- `vscode`: Used for development within the container

### Directory Structure
```
/app/                       # Main application directory (755)
├── .venv/                 # Python virtual environment (755)
├── llm_eval/             # Application code
│   ├── api.py           # FastAPI server
│   ├── client.py        # Python client for API
│   └── ui.py           # Streamlit user interface
└── ...

/home/
├── streamlit/            # Streamlit user home
│   └── .streamlit/      # Streamlit config directory (700)
│       ├── config.toml
│       ├── credentials.toml
│       └── secrets.toml
├── uvicorn/             # Uvicorn user home
└── vscode/              # Development user home
```

### Service Configuration
- **Streamlit**: Runs on port 8501
  - Uses dedicated streamlit user
  - Configuration stored in `/home/streamlit/.streamlit/`
  - Isolated permissions for secrets and credentials

- **FastAPI**: Runs on port 8000
  - Uses dedicated uvicorn user
  - Handles API requests
  - Auto-reloads during development

### Development Environment
The development environment is configured through VS Code's Remote Containers:
- Uses the `vscode` user for development tasks
- Has access to both service groups for debugging
- Python interpreter automatically configured to use the project's virtual environment
- Forwards both service ports automatically

### Logs
Service logs are available in `/var/log/supervisor/`:
- `llm_eval_fastapi.log`
- `llm_eval_fastapi_err.log`
- `llm_eval_streamlit.log`
- `llm_eval_streamlit_err.log`

You can view logs in real-time using:
```bash
tail -f /var/log/supervisor/llm_eval*.log
```

## Development

### Dependency Management
- The project uses Poetry for dependency management
- New dependencies can be added using:
  ```bash
  poetry add package-name
  ```
- Update dependencies:
  ```bash
  poetry update
  ```

### Manual Service Management
If needed, you can manually start services using the `start.sh` script:
```bash
./start.sh
```
This script will run each service with its appropriate user permissions.

### Security Notes
- Service users are isolated with minimal required permissions
- Streamlit secrets are protected with 700 permissions
- Virtual environment is readable by all services but owned by root
- Development user (vscode) has access to service groups for debugging
- Container uses proper UID mapping for mounted volumes
- Environment variables from `.env` are securely loaded and not exposed in logs

## Troubleshooting

### Container Issues
1. Permission problems:
   - Ensure the container was built with the latest Dockerfile
   - Check that service users exist and have correct permissions
   - Verify Streamlit configuration exists in `/home/streamlit/.streamlit/`
   - Check supervisor logs for specific error messages

2. API Authentication:
   - Verify your `.env` file exists and contains valid API keys
   - Check the API logs for authentication errors
   - Ensure the environment variables are properly loaded in the container

3. Development environment:
   - Ensure you're using the VS Code Remote Containers extension
   - Verify the Python interpreter is correctly set to `/app/.venv/bin/python`
   - Try rebuilding the container: F1 → "Remote-Containers: Rebuild Container"

3. Service Issues:
   - If the API server isn't responding:
     - Check the FastAPI logs in `/var/log/supervisor/llm_eval_fastapi*.log`
     - Ensure port 8000 isn't in use
   - If Streamlit isn't loading:
     - Check the Streamlit logs in `/var/log/supervisor/llm_eval_streamlit*.log`
     - Verify port 8501 isn't in use

## Testing

### Prerequisites
- Make sure you have Poetry installed
- All development dependencies are installed: `poetry install`

### Running Tests
To run all tests:
```bash
poetry run pytest
```