from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ParameterCreate(BaseModel):
    name: str
    value: str
    datatype: str

class ExperimentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parameters: List[ParameterCreate] = []

class ParameterResponse(BaseModel):
    id: int
    name: str
    value: str
    datatype: str

    class Config:
        orm_mode = True

class OutputResponse(BaseModel):
    id: int
    output_name: str
    output_value: str
    output_datatype: str

    class Config:
        orm_mode = True

class ExperimentResponse(BaseModel):
    id: int
    name: str
    timestamp: datetime
    description: Optional[str]
    status: str
    parameters: List[ParameterResponse]
    outputs: List[OutputResponse]

    class Config:
        orm_mode = True 