import * as z from "zod"

// Define the metadata schema
const metadataSchema = z.object({
  timestamp: z.string(),
  source: z.string(),
  date: z.string()
})

// Define the node properties schemas
const companyProperties = z.object({
  name: z.string(),
  industry: z.string().optional(),
  founding_date: z.string().optional(),
  location: z.string().optional(),
  employee_count: z.number().optional(),
  patent_count: z.number().optional(),
  product: z.string().optional(),
  division: z.string().optional(),
  type: z.string().optional()
})

const personProperties = z.object({
  name: z.string(),
  title: z.string().optional()
})

const eventProperties = z.object({
  type: z.string(),
  amount: z.number().optional(),
  date: z.string().optional(),
  currency: z.string().optional()
})

// Define the node schema with discriminated union
const nodeSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    type: z.literal("Company"),
    properties: companyProperties
  }),
  z.object({
    id: z.string(),
    type: z.literal("Person"),
    properties: personProperties
  }),
  z.object({
    id: z.string(),
    type: z.literal("Event"),
    properties: eventProperties
  })
])

// Define the relationship schema
const relationshipSchema = z.object({
  source: z.string(),
  target: z.string(),
  type: z.string(),
  properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional()
})

// Define the complete graph schema
export const graphSchema = z.object({
  metadata: metadataSchema,
  nodes: z.array(nodeSchema),
  relationships: z.array(relationshipSchema)
})

// Type inference
export type GraphData = z.infer<typeof graphSchema> 