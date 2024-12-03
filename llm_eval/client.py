import aisuite as ai
import time
import pandas as pd
from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class ExperimentResult:
    model: str
    system_prompt: str
    user_prompt: str
    response: str
    temperature: float
    elapsed_time: float

def run_experiment(
    models: List[str],
    messages: List[Dict[str, str]],
    temperature: float = 0.75) -> pd.DataFrame:
    client = ai.Client()
    results = []
    
    for model in models:
        start_time = time.time()
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature
        )
        elapsed_time = time.time() - start_time
        
        results.append(ExperimentResult(
            model=model,
            system_prompt=messages[0]["content"],
            user_prompt=messages[1]["content"],
            response=response.choices[0].message.content,
            temperature=temperature,
            elapsed_time=elapsed_time
        ))
    
    return pd.DataFrame([vars(r) for r in results])

def main():
    models = ["openai:gpt-4o-mini", "anthropic:claude-3-5-haiku-20241022"]
    messages = [
        {"role": "system", "content": "Respond in Pirate English."},
        {"role": "user", "content": "Tell me a joke."},
    ]
    
    results_df = run_experiment(models, messages)
    print(results_df.to_string())

if __name__ == "__main__":
    main()
