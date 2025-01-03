from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class ExperimentCreate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: str
    user_prompt: str
    models: List[str]

    model_config = ConfigDict(from_attributes=True)

class ParameterCreate(BaseModel):
    name: str
    value: str
    datatype: str

class ParameterResponse(BaseModel):
    id: int
    name: str
    value: str
    datatype: str

    model_config = ConfigDict(from_attributes=True)

class OutputResponse(BaseModel):
    id: int
    output_name: str
    output_value: str
    output_datatype: str

    model_config = ConfigDict(from_attributes=True)

class ExperimentResponse(BaseModel):
    id: int
    name: str
    timestamp: datetime
    description: Optional[str]
    status: str
    parameters: List[ParameterResponse]
    outputs: List[OutputResponse]

    model_config = ConfigDict(from_attributes=True) 