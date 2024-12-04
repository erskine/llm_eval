from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import time
import aisuite as ai

app = FastAPI()

class Experiment(BaseModel):
    system_prompt: str
    user_prompt: str
    models: List[str]

class ExperimentResult(BaseModel):
    model: str
    response: str
    elapsed_time: float

@app.post("/run_experiment/")
async def run_experiment(experiment: Experiment):
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
            response=response.choices[0].message.content,
            elapsed_time=elapsed_time
        ))
    
    return {
        "experiment_config": experiment.dict(),
        "results": [result.dict() for result in results]
    } 