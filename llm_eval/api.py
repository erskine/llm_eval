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

from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
import time
import aisuite as ai
from dotenv import load_dotenv
import tiktoken
import logging
from datetime import datetime
from contextlib import asynccontextmanager

from llm_eval.db.session import get_db
from llm_eval.db.models import ExperimentRun, Parameter, ExperimentOutput
from llm_eval.db.base import init_db
from llm_eval.db import crud

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables at startup
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

class Experiment(BaseModel):
    system_prompt: str
    user_prompt: str
    models: List[str]
    name: Optional[str] = None
    description: Optional[str] = None

class ExperimentResult(BaseModel):
    model: str
    response: str
    elapsed_time: float
    token_counts: Dict[str, int]

def count_tokens(text: str, model: str) -> int:
    """Count the number of tokens in a text string for a specific model."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        # Fall back to cl100k_base encoding for unknown models
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

@app.post("/run_experiment/")
async def run_experiment(experiment: Experiment, db: Session = Depends(get_db)):
    client = ai.Client()
    results = []
    
    # Use crud function to create experiment
    db_experiment = crud.create_experiment(db, experiment)

    # Save experiment parameters
    parameters = [
        Parameter(name="system_prompt", value=experiment.system_prompt, datatype="str"),
        Parameter(name="user_prompt", value=experiment.user_prompt, datatype="str"),
        Parameter(name="models", value=",".join(experiment.models), datatype="str"),
    ]
    db_experiment.parameters.extend(parameters)
    db.commit()
    
    messages = [
        {"role": "system", "content": experiment.system_prompt},
        {"role": "user", "content": experiment.user_prompt},
    ]
    
    for model in experiment.models:
        # Count input tokens
        input_tokens = sum(
            count_tokens(msg["content"], model) for msg in messages
        )
        
        logger.info(f"Input tokens for {model}: {input_tokens}")
        
        start_time = time.time()
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7
        )
        elapsed_time = time.time() - start_time
        
        # Count output tokens
        output_text = response.choices[0].message.content
        output_tokens = count_tokens(output_text, model)
        
        logger.info(f"Output tokens for {model}: {output_tokens}")
        
        # Save outputs to database
        outputs = [
            ExperimentOutput(
                output_name=f"{model}_response",
                output_value=output_text,
                output_datatype="str"
            ),
            ExperimentOutput(
                output_name=f"{model}_elapsed_time",
                output_value=str(elapsed_time),
                output_datatype="float"
            ),
            ExperimentOutput(
                output_name=f"{model}_input_tokens",
                output_value=str(input_tokens),
                output_datatype="int"
            ),
            ExperimentOutput(
                output_name=f"{model}_output_tokens",
                output_value=str(output_tokens),
                output_datatype="int"
            ),
            ExperimentOutput(
                output_name=f"{model}_total_tokens",
                output_value=str(input_tokens + output_tokens),
                output_datatype="int"
            ),
        ]
        db_experiment.outputs.extend(outputs)
        
        # Create result for API response
        result = ExperimentResult(
            model=model,
            response=output_text,
            elapsed_time=elapsed_time,
            token_counts={
                "input": input_tokens,
                "output": output_tokens,
                "total": input_tokens + output_tokens
            }
        )
        
        logger.info(f"Token counts for {model}: {result.token_counts}")
        results.append(result)
    
    # Update experiment status
    db_experiment.status = "COMPLETED"
    db.commit()
    
    final_response = {
        "experiment_id": db_experiment.id,
        "experiment_config": experiment.dict(),
        "results": [result.dict() for result in results]
    }
    
    logger.info(f"Sending response: {final_response}")
    return final_response

@app.get("/experiments/{experiment_id}")
def get_experiment(experiment_id: int, db: Session = Depends(get_db)):
    # Use crud function to get experiment
    experiment = crud.get_experiment(db, experiment_id)
    if experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    # Convert to a more user-friendly format
    return {
        "id": experiment.id,
        "name": experiment.name,
        "timestamp": experiment.timestamp,
        "description": experiment.description,
        "status": experiment.status,
        "parameters": {p.name: p.value for p in experiment.parameters},
        "outputs": {o.output_name: o.output_value for o in experiment.outputs}
    } 