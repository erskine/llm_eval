from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ExperimentRun(Base):
    __tablename__ = 'experiment_runs'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    description = Column(Text)
    status = Column(String, nullable=False)
    
    parameters = relationship("Parameter", back_populates="experiment")
    outputs = relationship("ExperimentOutput", back_populates="experiment")

class Parameter(Base):
    __tablename__ = 'parameters'
    
    id = Column(Integer, primary_key=True)
    run_id = Column(Integer, ForeignKey('experiment_runs.id'))
    name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    datatype = Column(String, nullable=False)
    
    experiment = relationship("ExperimentRun", back_populates="parameters")

class ExperimentOutput(Base):
    __tablename__ = 'experiment_outputs'
    
    id = Column(Integer, primary_key=True)
    run_id = Column(Integer, ForeignKey('experiment_runs.id'))
    output_name = Column(String, nullable=False)
    output_value = Column(String, nullable=False)
    output_datatype = Column(String, nullable=False)
    
    experiment = relationship("ExperimentRun", back_populates="outputs") 