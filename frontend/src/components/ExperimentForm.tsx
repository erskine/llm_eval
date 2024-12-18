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
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

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

type ExperimentStatus = "idle" | "running" | "complete" | "error"

export function ExperimentForm() {
  const [status, setStatus] = useState<ExperimentStatus>("idle")
  const [result, setResult] = useState<ExperimentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      setStatus("running")
      setError(null)
      setResult(null)

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
      setResult(data)
      setStatus("complete")
    } catch (error) {
      console.error('Error submitting experiment:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setStatus("error")
    }
  }

  const isSubmitting = status === "running"

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md font-primary">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-primary font-bold text-lg text-primary-dark dark:text-gray-100">Experiment Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter experiment name..." 
                  {...field} 
                  className="font-primary bg-secondary-lightGrey dark:bg-gray-700 dark:text-gray-100 border-secondary-grey focus-visible:ring-primary" 
                />
              </FormControl>
              <FormDescription className="font-secondary text-sm dark:text-gray-300">
                A name to identify your experiment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-primary font-bold text-lg text-primary-dark dark:text-gray-100">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter experiment description..."
                  className="min-h-[60px] font-primary bg-secondary-lightGrey dark:bg-gray-700 dark:text-gray-100 border-secondary-grey focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormDescription className="font-secondary text-sm dark:text-gray-300">
                A brief description of what you're testing
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-primary font-bold text-lg text-primary-dark dark:text-gray-100">System Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the system prompt..."
                  className="min-h-[100px] font-primary bg-secondary-lightGrey dark:bg-gray-700 dark:text-gray-100 border-secondary-grey focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormDescription className="font-secondary text-sm dark:text-gray-300">
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
              <FormLabel className="font-primary font-bold text-lg text-primary-dark dark:text-gray-100">User Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the user prompt..."
                  className="min-h-[100px] font-primary bg-secondary-lightGrey dark:bg-gray-700 dark:text-gray-100 border-secondary-grey focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormDescription className="font-secondary text-sm dark:text-gray-300">
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
              <FormLabel className="font-primary font-bold text-lg text-primary-dark dark:text-gray-100">Models</FormLabel>
              <FormControl>
                <select
                  multiple
                  className="min-h-[100px] w-full rounded-md border border-secondary-grey bg-secondary-lightGrey dark:bg-gray-700 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary dark:text-gray-100"
                  value={field.value}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value)
                    field.onChange(values)
                  }}
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model} value={model} className="dark:text-gray-100 bg-secondary-lightGrey dark:bg-gray-700">
                      {model}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription className="font-secondary text-sm dark:text-gray-300">
                Select one or more AI models to test (use Ctrl/Cmd + click to select multiple)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary-dark text-white transition-colors font-primary font-medium"
        >
          {isSubmitting ? "Running Experiment..." : "Run Experiment"}
        </Button>

        {status === "running" && (
          <Card className="p-4 border-secondary-grey bg-secondary-lightGrey">
            <p className="text-center text-primary-dark font-secondary italic">Running experiment, please wait...</p>
          </Card>
        )}

        {status === "error" && error && (
          <Card className="p-4 border-red-500 bg-red-50">
            <p className="text-red-600">Error: {error}</p>
          </Card>
        )}

        {status === "complete" && result && (
          <Card className="p-4 border-secondary-green">
            <h3 className="font-primary font-bold text-xl mb-4 text-primary-dark">Results</h3>
            <ScrollArea className="h-[400px]">
              {result.results.map((modelResult, index) => (
                <div key={index} className="mb-6 p-4 bg-secondary-lightGrey rounded-lg">
                  <h4 className="font-primary font-medium text-lg mb-2 text-primary">{modelResult.model}</h4>
                  <div className="space-y-2">
                    <p className="font-primary"><span className="font-medium text-primary-dark">Time:</span> {modelResult.elapsed_time.toFixed(2)}s</p>
                    <p className="font-primary"><span className="font-medium text-primary-dark">Tokens:</span> {modelResult.token_counts.total} 
                      (Input: {modelResult.token_counts.input}, 
                      Output: {modelResult.token_counts.output})</p>
                    <div className="mt-2">
                      <p className="font-primary font-medium text-primary-dark">Response:</p>
                      <p className="font-secondary whitespace-pre-wrap bg-white p-4 rounded-md border border-secondary-grey">
                        {modelResult.response}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </Card>
        )}
      </form>
    </Form>
  )
} 