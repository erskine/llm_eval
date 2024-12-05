#!/bin/bash

# Function to show usage
show_usage() {
    echo "Usage: llm_eval.sh [restart|status|logs] [fastapi|streamlit|all]"
    echo "Examples:"
    echo "  llm_eval.sh restart all      # Restart both services"
    echo "  llm_eval.sh restart fastapi  # Restart only FastAPI"
    echo "  llm_eval.sh status           # Show status of all services"
    echo "  llm_eval.sh logs fastapi     # Show FastAPI logs"
    echo "  llm_eval.sh logs streamlit   # Show Streamlit logs"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "Please run with sudo"
    exit 1
fi

action=$1
service=$2

case $action in
    "restart")
        case $service in
            "fastapi")
                supervisorctl restart fastapi
                ;;
            "streamlit")
                supervisorctl restart streamlit
                ;;
            "all")
                supervisorctl restart all
                ;;
            *)
                show_usage
                exit 1
                ;;
        esac
        ;;
    "status")
        supervisorctl status
        ;;
    "logs")
        case $service in
            "fastapi")
                tail -f /var/log/supervisor/llm_eval_fastapi*.log
                ;;
            "streamlit")
                tail -f /var/log/supervisor/llm_eval_streamlit*.log
                ;;
            *)
                show_usage
                exit 1
                ;;
        esac
        ;;
    *)
        show_usage
        exit 1
        ;;
esac 