import { graphSchema, GraphData } from '@/schemas/graph';
import { ZodError } from 'zod';

interface ValidationResult {
  isValid: boolean;
  data?: GraphData;
  errors?: ZodError;
}

export function validateGraphData(data: unknown): ValidationResult {
  try {
    const validatedData = graphSchema.parse(data);
    return {
      isValid: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        errors: error
      };
    }
    throw error; // Re-throw unexpected errors
  }
} 