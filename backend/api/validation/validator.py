import json
from pathlib import Path
from typing import Dict, Any, Tuple, Optional

from .schemas import KnowledgeGraph, ValidationMetadata

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass

class GraphValidator:
    def __init__(self):
        self.errors = []

    def validate_file_structure(self, directory: Path) -> bool:
        """Validate that all required files exist in the validation directory"""
        required_files = ['metadata.json', 'ground_truth_graph.json', 'source.txt']
        return all((directory / file).exists() for file in required_files)

    def load_and_validate_json(self, file_path: Path, schema_class) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """Load and validate a JSON file against a Pydantic schema"""
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            validated_data = schema_class.model_validate(data)
            return True, validated_data.model_dump()
        except Exception as e:
            self.errors.append(f"Error validating {file_path.name}: {str(e)}")
            return False, None

    def validate_directory(self, directory: Path) -> Tuple[bool, Dict[str, Any]]:
        """Validate all files in a validation directory"""
        self.errors = []  # Reset errors
        
        if not self.validate_file_structure(directory):
            self.errors.append(f"Directory {directory} is missing required files")
            return False, {"errors": self.errors}

        # Validate metadata
        metadata_valid, metadata = self.load_and_validate_json(
            directory / "metadata.json", 
            ValidationMetadata
        )

        # Validate ground truth graph
        graph_valid, graph = self.load_and_validate_json(
            directory / "ground_truth_graph.json", 
            KnowledgeGraph
        )

        is_valid = metadata_valid and graph_valid
        
        result = {
            "is_valid": is_valid,
            "errors": self.errors if not is_valid else [],
            "metadata": metadata if metadata_valid else None,
            "graph": graph if graph_valid else None
        }

        return is_valid, result 