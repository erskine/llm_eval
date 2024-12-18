import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ExperimentRequest, ExperimentResponse } from "@/types/api"

const formSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  systemPrompt: z.string().min(1, {
    message: "System prompt is required",
  }),
  userPrompt: z.string().min(1, {
    message: "User prompt is required",
  }),
  models: z.array(z.string()).min(1, {
    message: "Please select at least one model",
  }),
})

const AVAILABLE_MODELS = [
    "openai:gpt-4o-mini",
    "anthropic:claude-3-5-haiku-20241022",
    "openai:gpt-4o",
    "anthropic:claude-3-5-sonnet-20241022"
] as const

export function ExperimentForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemPrompt: "",
      userPrompt: "",
      models: [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const experimentRequest: ExperimentRequest = {
        name: values.name,
        description: values.description,
        system_prompt: values.systemPrompt,
        user_prompt: values.userPrompt,
        models: values.models,
      }

      const response = await fetch('/api/v1/experiments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experimentRequest),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to submit experiment')
      }

      const data: ExperimentResponse = await response.json()
      console.log('Experiment submitted successfully:', data)
      form.reset()
    } catch (error) {
      console.error('Error submitting experiment:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>System Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the system prompt..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The system prompt that defines the AI's behavior
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="userPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the user prompt..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The prompt that will be sent to the AI models
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="models"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Models</FormLabel>
              <FormControl>
                <select
                  multiple
                  className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={field.value}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value)
                    field.onChange(values)
                  }}
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>
                Select one or more AI models to test (use Ctrl/Cmd + click to select multiple)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Run Experiment</Button>
      </form>
    </Form>
  )
} 