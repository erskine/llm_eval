#!/bin/bash
poetry run uvicorn llm_eval.api:app --host 0.0.0.0 --port 8000 & 
poetry run streamlit run llm_eval/ui.py --server.port 8501 --server.address 0.0.0.0