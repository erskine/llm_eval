from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from .base import Base

class ExperimentRun(Base):
    __tablename__ = 'experiment_runs'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    description = Column(Text)
    status = Column(String, nullable=False)
    
    parameters = relationship("Parameter", back_populates="experiment", cascade="all, delete-orphan")
    outputs = relationship("ExperimentOutput", back_populates="experiment", cascade="all, delete-orphan")

class Parameter(Base):
    __tablename__ = 'parameters'
    
    id = Column(Integer, primary_key=True)
    run_id = Column(Integer, ForeignKey('experiment_runs.id', ondelete='CASCADE'))
    name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    datatype = Column(String, nullable=False)
    
    experiment = relationship("ExperimentRun", back_populates="parameters")

class ExperimentOutput(Base):
    __tablename__ = 'experiment_outputs'
    
    id = Column(Integer, primary_key=True)
    run_id = Column(Integer, ForeignKey('experiment_runs.id', ondelete='CASCADE'))
    output_name = Column(String, nullable=False)
    output_value = Column(String, nullable=False)
    output_datatype = Column(String, nullable=False)
    
    experiment = relationship("ExperimentRun", back_populates="outputs") 