from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class NodeProperties(BaseModel):
    """Base class for node properties - can be extended per node type"""
    model_config = {
        "extra": "allow"  # Allow additional fields not in the schema
    }

class Node(BaseModel):
    id: str
    type: str
    properties: Dict[str, Any]

class Relationship(BaseModel):
    source: str
    target: str
    type: str
    properties: Dict[str, Any] = Field(default_factory=dict)

class GraphMetadata(BaseModel):
    timestamp: datetime
    source: str
    date: str

class KnowledgeGraph(BaseModel):
    metadata: GraphMetadata
    nodes: List[Node]
    relationships: List[Relationship]

class ValidationMetrics(BaseModel):
    expected_entity_count: int
    expected_relationship_count: int
    entity_types: List[str]
    key_relationships: List[str]

class ValidationMetadata(BaseModel):
    id: str
    domain: str
    complexity: str
    metrics: ValidationMetrics
    tags: List[str]
    created: str
    version: str 