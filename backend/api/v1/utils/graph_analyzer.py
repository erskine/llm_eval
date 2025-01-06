from typing import Dict, Any

class GraphAnalyzer:
    @staticmethod
    def analyze_graph(json_data: Dict[str, Any]) -> Dict[str, int]:
        """
        Analyzes a graph JSON structure and returns metrics about nodes, relationships, and their properties.
        
        Returns:
            Dict containing counts for:
            - node_count: Total number of nodes
            - relationship_count: Total number of relationships
            - node_property_count: Total number of properties across all nodes
            - relationship_property_count: Total number of properties across all relationships
        """
        nodes = json_data.get("nodes", [])
        relationships = json_data.get("relationships", [])
        
        # Count total properties across all nodes
        node_property_count = sum(
            len(node.get("properties", {}))
            for node in nodes
        )
        
        # Count total properties across all relationships
        relationship_property_count = sum(
            len(rel.get("properties", {}))
            for rel in relationships
        )
        
        return {
            "node_count": len(nodes),
            "relationship_count": len(relationships),
            "node_property_count": node_property_count,
            "relationship_property_count": relationship_property_count
        } 