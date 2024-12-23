from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from pydantic import BaseModel

from ..validation.json_validator import JsonValidator, SchemaType

router = APIRouter(prefix="/validation", tags=["validation"])

class ValidationRequest(BaseModel):
    json_str: str
    schema_type: SchemaType

@router.post("/validate-json")
async def validate_json(request: ValidationRequest) -> Dict[str, Any]:
    """
    Validate a JSON string against a specified schema
    """
    try:
        validator = JsonValidator()
        is_valid, result = validator.validate_json(
            request.json_str,
            request.schema_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 