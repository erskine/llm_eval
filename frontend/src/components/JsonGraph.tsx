import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { validateGraphData } from '@/utils/graphValidation';
import { GraphData, getPropertyValue } from '@/schemas/graph';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface JsonGraphProps {
  data: unknown;
  width?: number;
  height?: number;
}

interface Property {
  key: string;
  value: string | number | boolean | null;
}

interface Node {
  id: string;
  type: string;
  name: string;
  properties: Property[];
}

interface Relationship {
  source_id: string;
  target_id: string;
  type: string;
  name: string;
  properties?: Property[];
}

interface VisGraphNode {
  id: string;
  label: string;
  group?: string;
  properties: Property[];
}

interface VisGraphLink {
  source: string;
  target: string;
  label: string;
  properties?: Property[];
}

interface VisGraphData {
  nodes: VisGraphNode[];
  links: VisGraphLink[];
}

export function JsonGraph({ data, width = 800, height = 600 }: JsonGraphProps) {
  const [ForceGraph2D, setForceGraph2D] = useState<any>(null);
  const validationResult = useMemo(() => validateGraphData(data), [data]);

  useEffect(() => {
    import('react-force-graph-2d').then(module => {
      setForceGraph2D(module.default);
    });
  }, []);

  const formatProperties = useCallback((properties: Property[]) => {
    return properties
      .map(({ key, value }) => `${key}: ${value}`)
      .join('\n');
  }, []);

  const graphData = useMemo(() => {
    if (!validationResult.isValid || !validationResult.data) {
      return { nodes: [], links: [] };
    }

    const validData = validationResult.data;
    const visGraph: VisGraphData = { nodes: [], links: [] };

    // Transform nodes
    visGraph.nodes = validData.nodes.map(node => ({
      id: node.id,
      label: node.name,
      group: node.type.toLowerCase(),
      properties: node.properties
    }));

    // Transform relationships
    visGraph.links = validData.relationships.map(rel => ({
      source: rel.source_id,
      target: rel.target_id,
      label: rel.name,
      properties: rel.properties
    }));

    return visGraph;
  }, [validationResult]);

  const nodeTitle = useCallback((node: VisGraphNode) => {
    if (!node.properties?.length) {
      return `${node.label} (${node.group})`;
    }
    return `${node.label} (${node.group})\n\n${formatProperties(node.properties)}`;
  }, [formatProperties]);

  const linkTitle = useCallback((link: VisGraphLink) => {
    return link.label;
  }, []);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    const label = node.label;
    const fontSize = 12;
    ctx.font = `${fontSize}px Sans-Serif`;
    
    // Color nodes based on type
    switch (node.group) {
      case 'company':
        ctx.fillStyle = '#4f46e5'; // Indigo
        break;
      case 'person':
        ctx.fillStyle = '#16a34a'; // Green
        break;
      case 'event':
        ctx.fillStyle = '#dc2626'; // Red
        break;
      default:
        ctx.fillStyle = '#6b7280'; // Gray
    }
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#374151';
    ctx.fillText(label, node.x, node.y + 15);
  }, []);

  if (!validationResult.isValid) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Validation Error</AlertTitle>
        <AlertDescription>
          {validationResult.errors?.errors.map((error, index) => (
            <div key={index}>
              Path: {error.path.join('.')} - {error.message}
            </div>
          ))}
        </AlertDescription>
      </Alert>
    );
  }

  if (!ForceGraph2D) {
    return <Card className="p-4">Loading graph visualization...</Card>;
  }

  return (
    <Card className="p-4">
      <ForceGraph2D
        graphData={graphData}
        nodeCanvasObject={nodeCanvasObject}
        width={width}
        height={height}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        cooldownTicks={100}
        nodeLabel={nodeTitle}
        linkTitle={linkTitle}
        linkLabel={(link: VisGraphLink) => link.label}
        onNodeHover={(node: VisGraphNode | null) => console.log('Node hover event:', node)}
        onLinkHover={(link: VisGraphLink | null) => console.log('Link hover event:', link)}
      />
    </Card>
  );
} 