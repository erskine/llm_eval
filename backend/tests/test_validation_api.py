import json
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, date

from api.v1.main import app

client = TestClient(app)

# Valid test data
valid_graph = {
    "metadata": {
        "timestamp": datetime.now().isoformat(),
        "source": "Test Source",
        "date": date.today().isoformat()
    },
    "nodes": [
        {
            "id": "test_node",
            "type": "TestType",
            "properties": {"name": "Test Node"}
        }
    ],
    "relationships": [
        {
            "source": "test_node",
            "target": "test_node",
            "type": "SELF_REFERENCE",
            "properties": {}
        }
    ]
}

valid_metadata = {
    "id": "test_001",
    "domain": "test_domain",
    "complexity": "micro",
    "metrics": {
        "expected_entity_count": 1,
        "expected_relationship_count": 1,
        "entity_types": ["TestType"],
        "key_relationships": ["SELF_REFERENCE"]
    },
    "tags": ["test"],
    "created": date.today().isoformat(),
    "version": "1.0.0"
}

# Invalid test data
invalid_graph = {
    "metadata": {
        "timestamp": "not-a-date-time",  # Invalid datetime format
        "source": "Test Source"
        # Missing required 'date' field
    },
    "nodes": [
        {
            "id": "test_node",
            # Missing required 'type' field
            "properties": {"name": "Test Node"}
        }
    ],
    "relationships": []
}

invalid_metadata = {
    "id": "test_001",
    "domain": "test_domain",
    "complexity": "invalid_complexity",  # Not in enum
    "metrics": {
        "expected_entity_count": -1,  # Below minimum
        "expected_relationship_count": 1,
        "entity_types": ["TestType"],
        "key_relationships": ["SELF_REFERENCE"]
    },
    "tags": ["test"],
    "created": "not-a-date",  # Invalid date format
    "version": "1.0"
}

def test_validate_valid_graph():
    response = client.post(
        "/api/v1/validation/validate-json",
        json={
            "json_str": json.dumps(valid_graph),
            "schema_type": "graph_format"
        }
    )
    assert response.status_code == 200
    result = response.json()
    assert result["is_valid"] is True
    assert "data" in result

def test_validate_invalid_graph():
    response = client.post(
        "/api/v1/validation/validate-json",
        json={
            "json_str": json.dumps(invalid_graph),
            "schema_type": "graph_format"
        }
    )
    assert response.status_code == 200
    result = response.json()
    assert result["is_valid"] is False
    assert "error" in result
    print(f"\nGraph validation error: {result['error']}")
    if "schema_path" in result:
        print(f"Schema path: {result['schema_path']}")
    if "instance_path" in result:
        print(f"Instance path: {result['instance_path']}")

def test_validate_valid_metadata():
    response = client.post(
        "/api/v1/validation/validate-json",
        json={
            "json_str": json.dumps(valid_metadata),
            "schema_type": "evaluation_metadata"
        }
    )
    assert response.status_code == 200
    result = response.json()
    assert result["is_valid"] is True
    assert "data" in result

def test_validate_invalid_metadata():
    response = client.post(
        "/api/v1/validation/validate-json",
        json={
            "json_str": json.dumps(invalid_metadata),
            "schema_type": "evaluation_metadata"
        }
    )
    assert response.status_code == 200
    result = response.json()
    assert result["is_valid"] is False
    assert "error" in result
    print(f"\nMetadata validation error: {result['error']}")
    if "schema_path" in result:
        print(f"Schema path: {result['schema_path']}")
    if "instance_path" in result:
        print(f"Instance path: {result['instance_path']}")

def test_invalid_json_string():
    response = client.post(
        "/api/v1/validation/validate-json",
        json={
            "json_str": "not a json string",
            "schema_type": "graph_format"
        }
    )
    assert response.status_code == 200
    result = response.json()
    assert result["is_valid"] is False
    assert "error" in result
    print(f"\nInvalid JSON error: {result['error']}")

def test_invalid_schema_type():
    response = client.post(
        "/api/v1/validation/validate-json",
        json={
            "json_str": json.dumps(valid_graph),
            "schema_type": "invalid_schema"
        }
    )
    assert response.status_code == 422  # Validation error from FastAPI 