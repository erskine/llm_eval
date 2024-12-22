import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging
from sqlalchemy import inspect

logger = logging.getLogger(__name__)

# Create data directory if it doesn't exist
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# Use absolute path for SQLite database
DB_PATH = os.path.join(DATA_DIR, 'experiments.db')
engine = create_engine(f'sqlite:///{DB_PATH}', echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    """Initialize the database and create all tables"""
    from .models import ExperimentRun, Parameter, ExperimentOutput
    
    logger.info("Checking database initialization...")
    inspector = inspect(engine)
    if inspector.has_table("experiment_runs"):
        logger.info("Database tables already exist, skipping initialization")
        return
        
    logger.info("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise