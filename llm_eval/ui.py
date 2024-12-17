# Copyright 2024 Erskine Williams
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import streamlit as st
import requests
import json
import logging
import pandas as pd
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_experiment(experiment_data):
    url = "http://localhost:8000/run_experiment/"
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, headers=headers, json=experiment_data)
    return response.json() if response.status_code == 200 else None


def fetch_experiments():
    url = "http://localhost:8000/experiments/"
    response = requests.get(url)
    return response.json() if response.status_code == 200 else []


def fetch_experiment_details(experiment_id):
    url = f"http://localhost:8000/experiments/{experiment_id}"
    response = requests.get(url)
    return response.json() if response.status_code == 200 else None

st.title("LLM Experiment Runner")
# Check query parameters before loading tabs
exp_id = st.query_params.get("exp_id")
if exp_id:
    logger.info(f"Experiment ID {exp_id} found in query parameters.")
    ct = st.session_state.current_tab
    logger.info(f"Current tab: {ct}")
    # Set initial tab or state based on exp_id
    st.session_state.current_tab = "Browse Experiments"
    logger.info(f"New tab: {st.session_state.current_tab}")
# Create tabs
tabs = ["Run Experiment", "Browse Experiments"]
tab1, tab2 = st.tabs(tabs)

with tab1:
    # Input form
    with st.form("experiment_form"):
        experiment_name = st.text_input("Experiment Name (optional)")
        experiment_desc = st.text_area("Description (optional)")
        system_prompt = st.text_area(
            "System Prompt", "Respond in Pirate English.")
        user_prompt = st.text_area("User Prompt", "Tell me a joke.")

        available_models = [
            "openai:gpt-4o-mini",
            "anthropic:claude-3-5-haiku-20241022",
            "openai:gpt-4o",
            "anthropic:claude-3-5-sonnet-20241022"
        ]
        selected_models = st.multiselect(
            "Select Models",
            available_models,
            default=available_models[:2]
        )

        submitted = st.form_submit_button("Run Experiment")

        if submitted:
            experiment_data = {
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "models": selected_models,
                "name": experiment_name,
                "description": experiment_desc
            }

            with st.spinner("Running experiment..."):
                results = run_experiment(experiment_data)

            if results:
                # Display experiment status
                st.success(
                    f"Experiment #{results['experiment_id']} completed successfully!")

                # Display results in a nice format
                st.subheader("Results")

                # Display experiment config
                with st.expander("Experiment Configuration"):
                    st.json(results["experiment_config"])

                # Extract model results
                model_results = results.get("results", [])

                if model_results:
                    # Create columns based on number of results
                    num_columns = len(model_results)
                    cols = st.columns(num_columns)

                    # Display each model's results in its own column
                    for col, result in zip(cols, model_results):
                        with col:
                            model_name = result.get('model', 'Unknown Model')
                            st.markdown(f"**{model_name}**")

                            # Display metrics
                            elapsed_time = result.get('elapsed_time', 0)
                            st.metric("Time", f"{elapsed_time:.2f}s")

                            # Display token counts if available
                            token_counts = result.get('token_counts', {})
                            if token_counts:
                                st.metric("Total Tokens",
                                          token_counts.get('total', 0))
                                st.write(
                                    f"Input: {token_counts.get('input', 0)}")
                                st.write(
                                    f"Output: {token_counts.get('output', 0)}")

                            # Display response
                            st.text_area(
                                "Response",
                                result.get('response', 'No response'),
                                height=200,
                                disabled=True
                            )
                else:
                    st.warning("No model results available")
            else:
                st.error(
                    "Failed to run experiment. Please check if the API server is running.")


with tab2:
    st.subheader("Browse Experiments")

    # Search bar
    search_query = st.text_input("Search experiments", "")

    # Get selected experiment ID from query params
    selected_id = st.query_params.get("exp_id", None)

    # Fetch experiments
    experiments = fetch_experiments()

    if experiments:
        # Convert to DataFrame
        df = pd.DataFrame(experiments)

        # Format timestamp
        df['timestamp'] = pd.to_datetime(
            df['timestamp']).dt.strftime('%Y-%m-%d %H:%M:%S')

        # Format the ID column to include a markdown link without target attribute
        df['id'] = df['id'].apply(
            lambda x: f'<a href="?exp_id={x}" target="_self">{x}</a>')

        # Filter based on search query
        if search_query:
            mask = df.astype(str).apply(lambda x: x.str.contains(
                search_query, case=False)).any(axis=1)
            df = df[mask]

        # Display as interactive table
        st.write(
            df.to_html(escape=False, index=False),
            unsafe_allow_html=True,
            column_config={
                "id": "ID",
                "name": "Name",
                "timestamp": "Timestamp",
                "status": "Status",
                "description": "Description"
            },
            hide_index=True,
            use_container_width=True
        )

        # Show details if experiment is selected via URL param
        if selected_id:
            details = fetch_experiment_details(int(selected_id))
            if details:
                st.subheader(f"Experiment #{selected_id} Details")
                st.json(details)
            selected_id = None
    else:
        st.info("No experiments found")



