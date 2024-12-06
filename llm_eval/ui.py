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

def run_experiment(experiment_data):
    url = "http://localhost:8000/run_experiment/"
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, headers=headers, json=experiment_data)
    return response.json() if response.status_code == 200 else None

st.title("Experiment Runner")

# Input form
with st.form("experiment_form"):
    system_prompt = st.text_area("System Prompt", "Respond in Pirate English.")
    user_prompt = st.text_area("User Prompt", "Tell me a joke.")
    
    # Multi-select for models
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
            "models": selected_models
        }
        
        with st.spinner("Running experiment..."):
            results = run_experiment(experiment_data)
            
        if results:
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
                            st.metric("Total Tokens", token_counts.get('total', 0))
                            st.write(f"Input: {token_counts.get('input', 0)}")
                            st.write(f"Output: {token_counts.get('output', 0)}")
                        
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
            st.error("Failed to run experiment. Please check if the API server is running.") 