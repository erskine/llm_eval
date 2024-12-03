import aisuite as ai
import time
from dataclasses import dataclass, asdict
from typing import List, Dict, Any
import json

@dataclass
class Experiment:
    system_prompt: str
    user_prompt: str
    models: List[str]

@dataclass
class ExperimentResult:
    model: str
    system_prompt: str
    user_prompt: str
    response: str
    elapsed_time: float

def run_experiment(experiment: Experiment) -> Dict[str, Any]:
    """
    Execute an experiment and return results in a JSON-serializable format.
    """
    client = ai.Client()
    results = []
    
    messages = [
        {"role": "system", "content": experiment.system_prompt},
        {"role": "user", "content": experiment.user_prompt},
    ]
    
    for model in experiment.models:
        start_time = time.time()
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7  # Fixed temperature for now
        )
        elapsed_time = time.time() - start_time
        
        results.append(ExperimentResult(
            model=model,
            system_prompt=experiment.system_prompt,
            user_prompt=experiment.user_prompt,
            response=response.choices[0].message.content,
            elapsed_time=elapsed_time
        ))
    
    # Convert to JSON-serializable format
    return {
        "experiment_config": asdict(experiment),
        "results": [asdict(r) for r in results]
    }

def main():
    # Example usage
    experiment = Experiment(
        system_prompt="Respond in Pirate English.",
        user_prompt="Tell me a joke.",
        models=["openai:gpt-4o-mini", "anthropic:claude-3-5-haiku-20241022"]
    )
    
    results = run_experiment(experiment)
    
    # Pretty print JSON output
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
