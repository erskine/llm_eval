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
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useExperimentContext } from "@/context/ExperimentContext"
import { JsonGraph } from "@/components/JsonGraph"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExamplePrompts } from "@/components/ExamplePrompts"

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

function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function ExperimentForm() {
  const [status, setStatus] = useState<ExperimentStatus>("idle")
  const [result, setResult] = useState<ExperimentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { selectedExperiment, setSelectedExperiment } = useExperimentContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemPrompt: "",
      userPrompt: "",
      models: [],
    },
  })

  useEffect(() => {
    if (selectedExperiment?.parameters) {
      form.reset({
        name: selectedExperiment.name,
        description: selectedExperiment.description,
        systemPrompt: selectedExperiment.parameters.system_prompt,
        userPrompt: selectedExperiment.parameters.user_prompt,
        models: selectedExperiment.parameters.models || [],
      });
      setSelectedExperiment(null);
    }
  }, [selectedExperiment, form, setSelectedExperiment]);

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

      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      console.log('Submitting request:', {
        url: `${baseUrl}/api/v1/experiments/`,
        method: 'POST',
        payload: experimentRequest
      });

      const response = await fetch(`${baseUrl}/api/v1/experiments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experimentRequest),
      })
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`Failed to submit experiment: ${response.status} ${response.statusText}\n${responseText}`);
      }

      // Only try to parse JSON if we have content
      const data: ExperimentResponse = responseText ? JSON.parse(responseText) : null;
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-[1200px] mx-auto bg-card p-8 rounded-lg shadow-md">
        {/* First row - two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experiment Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter experiment name..." 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter experiment description..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A brief description of what you're testing
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        {/* Second row - two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="systemPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the system prompt..."
                    className="min-h-[150px] resize-none"
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
                    className="min-h-[150px] resize-none"
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
        </div>

        {/* Third row - models and submit button */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="models"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Models</FormLabel>
                <FormControl>
                  <select
                    multiple
                    className="min-h-[100px] w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

          <div className="flex justify-end items-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-[200px]"
            >
              {isSubmitting ? "Running..." : "Run Experiment"}
            </Button>
          </div>
        </div>

        {/* Status and results section */}
        {status === "running" && (
          <Card className="p-4">
            <p className="text-center text-muted-foreground italic">Running experiment, please wait...</p>
          </Card>
        )}

        {status === "error" && error && (
          <Card className="p-4 border-destructive">
            <p className="text-destructive">Error: {error}</p>
          </Card>
        )}

        {status === "complete" && result && (
          <Card className="p-4">
            <h3 className="font-semibold text-xl mb-4">Results</h3>
            <ScrollArea className="h-[600px] w-full rounded-md border">
              {result.results.map((modelResult, index) => (
                <div key={index} className="mb-6 p-4 border-b last:border-b-0">
                  <h4 className="font-medium text-lg mb-2">{modelResult.model}</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Time:</span> {modelResult.elapsed_time.toFixed(2)}s</p>
                    <p><span className="font-medium">Tokens:</span> {modelResult.token_counts.total} 
                      (Input: {modelResult.token_counts.input}, 
                      Output: {modelResult.token_counts.output})</p>
                    <div className="mt-2">
                      <p className="font-medium">Response:</p>
                      {isValidJson(modelResult.response) ? (
                        <Card className="p-4">
                          <Tabs defaultValue="raw" className="w-full">
                            <TabsList className="w-full justify-start">
                              <TabsTrigger value="raw">JSON Response</TabsTrigger>
                              <TabsTrigger value="graph">Graph Visualization</TabsTrigger>
                            </TabsList>
                            <TabsContent value="raw">
                              <pre className="whitespace-pre-wrap bg-muted/50 p-4 rounded-md overflow-auto max-h-[600px]">
                                {JSON.stringify(JSON.parse(modelResult.response), null, 2)}
                              </pre>
                            </TabsContent>
                            <TabsContent value="graph">
                              <div className="border rounded-md p-4">
                                <JsonGraph 
                                  data={JSON.parse(modelResult.response)} 
                                  height={600}
                                  width={1000}
                                />
                              </div>
                            </TabsContent>
                          </Tabs>
                        </Card>
                      ) : (
                        <p className="whitespace-pre-wrap bg-muted/50 p-4 rounded-md">
                          {modelResult.response}
                        </p>
                      )}
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