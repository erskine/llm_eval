from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

def create_experiment(db: Session, experiment: schemas.ExperimentCreate) -> models.ExperimentRun:
    db_experiment = models.ExperimentRun(
        name=experiment.name or "Unnamed Experiment",
        timestamp=datetime.now(),
        description=experiment.description,
        status="RUNNING"
    )
    db.add(db_experiment)
    db.commit()
    db.refresh(db_experiment)
    return db_experiment

def get_experiment(db: Session, experiment_id: int) -> models.ExperimentRun:
    return db.query(models.ExperimentRun).filter(models.ExperimentRun.id == experiment_id).first() 