#!/bin/bash
uvicorn llm_eval.api:app --reload --host 0.0.0.0 --port 8000 &
streamlit run llm_eval/ui.py --server.port 8501 --server.address 0.0.0.0