import json
from enum import Enum
from pathlib import Path
from typing import Dict, Any, Tuple
from jsonschema import validate, ValidationError
from fastapi import HTTPException

class SchemaType(str, Enum):
    GRAPH_FORMAT = "graph_format"
    EVALUATION_METADATA = "evaluation_metadata"

class JsonValidator:
    def __init__(self):
        self.schemas: Dict[SchemaType, Dict] = {}
        self._load_schemas()

    def _load_schemas(self):
        """Load all JSON schemas from the json_schemas directory"""
        schema_dir = Path(__file__).parent / "json_schemas"
        for schema_type in SchemaType:
            schema_path = schema_dir / f"{schema_type.value}.json"
            with open(schema_path) as f:
                self.schemas[schema_type] = json.load(f)

    def validate_json(self, json_str: str, schema_type: SchemaType) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate a JSON string against a specified schema
        
        Args:
            json_str: The JSON string to validate
            schema_type: The type of schema to validate against
            
        Returns:
            Tuple of (is_valid, result_dict)
        """
        try:
            # Parse JSON string
            json_data = json.loads(json_str)
            
            # Validate against schema
            validate(instance=json_data, schema=self.schemas[schema_type])
            
            return True, {
                "is_valid": True,
                "data": json_data
            }
            
        except json.JSONDecodeError as e:
            return False, {
                "is_valid": False,
                "error": f"Invalid JSON format: {str(e)}"
            }
            
        except ValidationError as e:
            return False, {
                "is_valid": False,
                "error": str(e.message),
                "schema_path": " -> ".join(str(x) for x in e.schema_path),
                "instance_path": " -> ".join(str(x) for x in e.path)
            }
            
        except Exception as e:
            return False, {
                "is_valid": False,
                "error": f"Unexpected error: {str(e)}"
            } 