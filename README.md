# LLM Evaluation Tool

A tool for running comparative experiments across different LLM models using FastAPI and Streamlit.

## Getting Started

### Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/) or [Cursor](https://www.cursor.com/)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [VS Code Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd llm-eval
   ```

2. Open the project in VS Code:
   ```bash
   code .
   ```

3. When prompted by VS Code, click "Reopen in Container" or:
   - Press `F1`
   - Type "Remote-Containers: Reopen in Container"
   - Press Enter

   The first build may take a few minutes as it sets up the development environment.

### Running the Application

The application consists of two components that need to be running simultaneously:

1. Start the FastAPI server:
   ```bash
   uvicorn llm_eval.api:app --reload --port 8000
   ```
   The API will be available at http://localhost:8000
   - API documentation: http://localhost:8000/docs

2. In a new terminal, start the Streamlit UI:
   ```bash
   streamlit run llm_eval/ui.py
   ```
   The UI will be available at http://localhost:8501

### Project Structure

```
llm-eval/
├── .devcontainer/          # Development container configuration
│   └── devcontainer.json
├── llm_eval/
│   ├── api.py             # FastAPI server
│   ├── client.py          # Python client for API
│   └── ui.py              # Streamlit user interface
├── Dockerfile             # Development container definition
├── pyproject.toml         # Poetry dependency management
└── README.md
```

### Using the Application

1. Open the Streamlit UI in your browser (http://localhost:8501)
2. Enter your desired:
   - System prompt
   - User prompt
   - Select the models you want to compare
3. Click "Run Experiment" to see the results

### Development

- The project uses Poetry for dependency management
- New dependencies can be added using:
  ```bash
  poetry add package-name
  ```
- Update dependencies:
  ```bash
  poetry update
  ```

### Troubleshooting

1. If the API server isn't responding:
   - Ensure it's running on port 8000
   - Check the terminal for any error messages

2. If Streamlit isn't loading:
   - Verify port 8501 isn't in use
   - Check the terminal for any error messages

3. Container issues:
   - Try rebuilding the container: F1 → "Remote-Containers: Rebuild Container"