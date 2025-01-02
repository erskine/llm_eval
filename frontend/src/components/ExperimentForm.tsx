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
import { ExperimentRequest, ExperimentResponse, Experiment } from "@/types/api"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useExperimentContext } from "@/context/ExperimentContext"
import { ExperimentDetailsDialog } from "@/components/ExperimentDetailsDialog"
import { useNavigate } from "react-router-dom"
import { useTabContext } from "@/context/TabContext"

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
    "anthropic:claude-3-5-haiku-20241022",
    "anthropic:claude-3-5-sonnet-20241022",
//    "google:gemini-1.5-flash:generateContent",
    "openai:gpt-4o",
    "openai:gpt-4o-mini"
] as const

type ExperimentStatus = "idle" | "running" | "complete" | "error"


export function ExperimentForm() {
  const [status, setStatus] = useState<ExperimentStatus>("idle")
  const [result, setResult] = useState<ExperimentResponse | null>(null)
  const { selectedExperiment, setSelectedExperiment } = useExperimentContext();
  const { setActiveTab } = useTabContext();
  const [statusUpdates, setStatusUpdates] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

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
      setStatusUpdates([]);
      setIsDialogOpen(true);

      const experimentRequest: ExperimentRequest = {
        name: values.name,
        description: values.description,
        system_prompt: values.systemPrompt,
        user_prompt: values.userPrompt,
        models: values.models,
      }

      setStatusUpdates(prev => [...prev, "Submitting experiment..."]);

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
      setStatusUpdates(prev => [...prev, "Experiment completed successfully!"]);
    } catch (error) {
      console.error('Error submitting experiment:', error)
      setStatus("error")
      setStatusUpdates(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`]);
      // Create minimal result object for error state
      setResult({
        id: 'error',
        results: [{
          model: 'system',
          elapsed_time: 0,
          token_counts: {
            total: 0,
            input: 0,
            output: 0
          },
          response: error instanceof Error ? error.message : 'An unexpected error occurred'
        }]
      });
    }
  }

  const isSubmitting = status === "running"

  const handleBrowseResults = () => {
    setActiveTab("results");
    navigate("/results");
  };

  const handleNewExperiment = () => {
    form.reset({
      name: "",
      description: "",
      systemPrompt: "",
      userPrompt: "",
      models: [] as string[],
    });
    setIsDialogOpen(false);
  };

  const handleRunAgain = (experiment: Experiment) => {
    if (experiment.parameters) {
      form.reset({
        name: experiment.name || "",
        description: experiment.description || "",
        systemPrompt: experiment.parameters.system_prompt,
        userPrompt: experiment.parameters.user_prompt,
        models: experiment.parameters.models,
      });
    }
    setIsDialogOpen(false);
  };

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

        <ExperimentDetailsDialog
          experiment={result ? { 
            id: result.id,
            name: form.getValues("name") || "Untitled Experiment",
            description: form.getValues("description") || "",
            timestamp: new Date().toISOString(),
            status: result.status || (status === "error" ? "ERROR" : status === "complete" ? "COMPLETED" : "RUNNING")
          } : null}
          experimentDetails={result ? {
            id: result.id,
            status: result.status || (status === "error" ? "ERROR" : status === "complete" ? "COMPLETED" : "RUNNING"),
            timestamp: new Date().toISOString(),
            parameters: {
              system_prompt: form.getValues("systemPrompt"),
              user_prompt: form.getValues("userPrompt"),
              models: form.getValues("models")
            },
            outputs: {
              ...(status === "error" ? { error_details: result.error_details } : {}),
              ...result.results.reduce((acc, result) => ({
                ...acc,
                [`${result.model}_elapsed_time`]: result.elapsed_time,
                [`${result.model}_total_tokens`]: result.token_counts.total,
                [`${result.model}_input_tokens`]: result.token_counts.input,
                [`${result.model}_output_tokens`]: result.token_counts.output,
                [`${result.model}_response`]: result.response,
              }), {})
            }
          } : null}
          isLoading={status === "running"}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onRunAgain={handleRunAgain}
          onBrowseResults={handleBrowseResults}
          onNewExperiment={handleNewExperiment}
          showAllActions={true}
          status={status}
          statusUpdates={statusUpdates}
        />
      </form>
    </Form>
  )
} 