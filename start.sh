#!/bin/bash

# Function to run command as specific user
run_as_user() {
    local user=$1
    shift
    sudo -u "$user" "$@"
}

# Start FastAPI
run_as_user uvicorn /app/.venv/bin/uvicorn llm_eval.api:app --reload --host 0.0.0.0 --port 8000 &

# Start Streamlit
run_as_user streamlit /app/.venv/bin/streamlit run llm_eval/ui.py --server.port 8501 --server.address 0.0.0.0