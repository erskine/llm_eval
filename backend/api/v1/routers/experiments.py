from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from pydantic import BaseModel
import time
import aisuite as ai
import logging
from fastapi.responses import JSONResponse

from persistence import schemas
from persistence.session import get_db
from persistence.models import ExperimentRun, Parameter, ExperimentOutput
from persistence import crud
from ..utils.token_counter import count_tokens

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/experiments/")
async def run_experiment(experiment: schemas.ExperimentCreate, db: Session = Depends(get_db)):
    logger.info(f"Received experiment request: {experiment}")
    try:
        client = ai.Client()
        results = []
        
        # Log the experiment data before creating DB entry
        logger.info(f"Creating experiment with data: {experiment.dict()}")
        
        # Use crud function to create experiment
        db_experiment = crud.create_experiment(db, experiment)
        logger.info(f"Created experiment in DB with ID: {db_experiment.id}")

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
            
            # Create result dictionary directly from database outputs
            result = {
                "model": model,
                "response": output_text,
                "elapsed_time": elapsed_time,
                "token_counts": {
                    "input": input_tokens,
                    "output": output_tokens,
                    "total": input_tokens + output_tokens
                }
            }
            results.append(result)
        
        # Update experiment status
        db_experiment.status = "COMPLETED"
        db.commit()
        
        final_response = {
            "experiment_id": db_experiment.id,
            "experiment_config": experiment.dict(),
            "results": results  # Now using the list of dictionaries directly
        }
        
        logger.info(f"Sending results: {final_response}")
        return final_response
    except Exception as e:
        logger.exception("Error processing experiment")
        # Return a proper error response instead of raising
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

@router.get("/experiments/{experiment_id}")
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

@router.get("/experiments/")
def list_experiments(db: Session = Depends(get_db)):
    experiments = crud.get_experiments(db)
    return [
        {
            "id": exp.id,
            "name": exp.name or f"Experiment #{exp.id}",
            "timestamp": exp.timestamp,
            "description": exp.description,
            "status": exp.status
        }
        for exp in experiments
    ] 