import * as z from "zod"

// Define the metadata schema
const metadataSchema = z.object({
  timestamp: z.string(),
  source: z.string(),
  date: z.string()
})

// Define property formats
const propertyValue = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const propertyItem = z.object({
  key: z.string(),
  value: propertyValue
});

// Properties must be an array of key-value pairs
const propertiesSchema = z.array(propertyItem);

// Define the node schema
const nodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  properties: propertiesSchema
})

// Define the relationship schema
const relationshipSchema = z.object({
  source_id: z.string(),
  target_id: z.string(),
  type: z.string(),
  name: z.string(),
  properties: propertiesSchema.optional()
})

// Define the complete graph schema
export const graphSchema = z.object({
  metadata: metadataSchema,
  nodes: z.array(nodeSchema),
  relationships: z.array(relationshipSchema)
})

// Type inference
export type GraphData = z.infer<typeof graphSchema>

// Helper function to get a property value by key
export function getPropertyValue(props: z.infer<typeof propertiesSchema>, key: string): z.infer<typeof propertyValue> | undefined {
  const prop = props.find(p => p.key === key);
  return prop?.value;
} 