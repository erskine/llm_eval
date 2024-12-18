from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from . import models  # Import models from the same directory

engine = create_engine('sqlite:///experiments.db', echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    from . import models  # Import models from the same directory
    Base.metadata.create_all(bind=engine) 