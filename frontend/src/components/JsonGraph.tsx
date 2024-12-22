import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { validateGraphData } from '@/utils/graphValidation';
import { GraphData } from '@/schemas/graph';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface JsonGraphProps {
  data: unknown;
  width?: number;
  height?: number;
}

interface VisGraphData {
  nodes: Array<{
    id: string;
    label: string;
    group?: string;
  }>;
  links: Array<{
    source: string;
    target: string;
    label: string;
  }>;
}

export function JsonGraph({ data, width = 800, height = 600 }: JsonGraphProps) {
  const [ForceGraph2D, setForceGraph2D] = useState<any>(null);
  const validationResult = useMemo(() => validateGraphData(data), [data]);

  useEffect(() => {
    import('react-force-graph-2d').then(module => {
      setForceGraph2D(module.default);
    });
  }, []);

  const graphData = useMemo(() => {
    if (!validationResult.isValid || !validationResult.data) {
      return { nodes: [], links: [] };
    }

    const validData = validationResult.data;
    const visGraph: VisGraphData = { nodes: [], links: [] };

    // Transform nodes
    visGraph.nodes = validData.nodes.map(node => {
      let label = node.id;
      
      switch (node.type) {
        case "Company":
          label = node.properties.name;
          break;
        case "Person":
          label = node.properties.name;
          break;
        case "Event": {
          const eventProps = node.properties;
          label = `${eventProps.type}${eventProps.date ? ` (${eventProps.date})` : ''}`;
          break;
        }
      }

      return {
        id: node.id,
        label,
        group: node.type.toLowerCase()
      };
    });

    // Transform relationships
    visGraph.links = validData.relationships.map(rel => ({
      source: rel.source,
      target: rel.target,
      label: rel.type
    }));

    return visGraph;
  }, [validationResult]);

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
        linkLabel="label"
        cooldownTicks={100}
      />
    </Card>
  );
} 