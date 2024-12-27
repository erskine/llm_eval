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
from ..services.experiment_service import ExperimentService

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

experiment_service = ExperimentService()

@router.post("/experiments/")
async def run_experiment(experiment: schemas.ExperimentCreate, db: Session = Depends(get_db)):
    logger.info(f"Received experiment request: {experiment}")
    try:
        return await experiment_service.run_experiment(experiment, db)
    except Exception as e:
        logger.exception("Received error from experiment service")
        # Return a proper error response
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