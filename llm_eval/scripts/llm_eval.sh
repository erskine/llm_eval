#!/bin/bash

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "Please run with sudo"
    exit 1
fi

# Use the virtual environment's Python
/app/.venv/bin/python /app/llm_eval/scripts/manage.py "$@" 