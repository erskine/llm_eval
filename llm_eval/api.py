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

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
import time
import aisuite as ai
from dotenv import load_dotenv
import tiktoken
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables at startup
load_dotenv()

app = FastAPI()

class Experiment(BaseModel):
    system_prompt: str
    user_prompt: str
    models: List[str]

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
async def run_experiment(experiment: Experiment):
    client = ai.Client()
    results = []
    
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
        
        # Create result with token counts
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
    
    final_response = {
        "experiment_config": experiment.dict(),
        "results": [result.dict() for result in results]
    }
    
    logger.info(f"Sending response: {final_response}")
    return final_response 