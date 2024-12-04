import requests
import json
from dataclasses import dataclass
from typing import List

@dataclass
class Experiment:
    system_prompt: str
    user_prompt: str
    models: List[str]

def run_experiment_via_api(experiment: Experiment) -> None:
    url = "http://127.0.0.1:8000/run_experiment/"
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, headers=headers, data=json.dumps(experiment.__dict__))
    
    if response.status_code == 200:
        results = response.json()
        print(json.dumps(results, indent=2))
    else:
        print(f"Failed to run experiment: {response.status_code} - {response.text}")

def main():
    # Example usage
    experiment = Experiment(
        system_prompt="Respond in Pirate English.",
        user_prompt="Tell me a joke.",
        models=["openai:gpt-4o-mini", "anthropic:claude-3-5-haiku-20241022"]
    )
    
    run_experiment_via_api(experiment)

if __name__ == "__main__":
    main()
