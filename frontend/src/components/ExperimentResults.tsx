import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExperiments } from "@/hooks/useExperiments";
import { useExperimentDetails } from "@/hooks/useExperimentDetails";
import { Loader2, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Experiment } from "@/types/api";
import { Button } from "@/components/ui/button";
import { useExperimentContext } from "@/context/ExperimentContext";
import { JsonGraph } from "@/components/JsonGraph";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function isValidJson(str: string): boolean {
  try {
    JSON.parse(str.trim());
    return true;
  } catch {
    return false;
  }
}

interface ExperimentResultsProps {
  onRunAgain?: (experiment: Experiment) => void;
}

export function ExperimentResults({ onRunAgain }: ExperimentResultsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: experiments = [], isLoading, error } = useExperiments();
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const { data: experimentDetails, isLoading: isLoadingDetails } = useExperimentDetails(
    selectedExperiment?.id ?? null
  );
  const { setSelectedExperiment: setContextExperiment } = useExperimentContext();
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(true);
  const [isUserPromptOpen, setIsUserPromptOpen] = useState(true);

  const handleExperimentClick = (experiment: Experiment) => {
    console.log('Clicked experiment:', experiment);
    setSelectedExperiment(experiment);
  };

  const handleRunAgain = () => {
    if (experimentDetails) {
      setContextExperiment({
        ...selectedExperiment!,
        parameters: experimentDetails.parameters
      });
      setSelectedExperiment(null);
      if (onRunAgain) {
        onRunAgain(selectedExperiment!);
      }
    }
  };

  const filteredExperiments = experiments.filter((experiment) =>
    Object.values(experiment)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Browse Experiments</h2>
      
      <Input
        placeholder="Search experiments..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">
          {error instanceof Error ? error.message : 'An error occurred'}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExperiments.length > 0 ? (
                filteredExperiments.map((experiment) => (
                  <TableRow 
                    key={experiment.id}
                    className="cursor-pointer"
                    onClick={() => handleExperimentClick(experiment)}
                  >
                    <TableCell>{experiment.id}</TableCell>
                    <TableCell>{experiment.name}</TableCell>
                    <TableCell>{experiment.timestamp}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        experiment.status === "ERROR" ? "bg-red-100 text-red-800" :
                        experiment.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {experiment.status}
                      </span>
                    </TableCell>
                    <TableCell>{experiment.description}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No experiments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={selectedExperiment !== null} onOpenChange={(open) => !open && setSelectedExperiment(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedExperiment?.name || 'Experiment Details'}</DialogTitle>
            <DialogDescription>
              {selectedExperiment?.description}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            {isLoadingDetails ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : experimentDetails ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>ID: {experimentDetails.id}</div>
                    <div>
                      Status: 
                      <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                        experimentDetails.status === "ERROR" ? "bg-red-100 text-red-800" :
                        experimentDetails.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {experimentDetails.status}
                      </span>
                    </div>
                    <div>Timestamp: {experimentDetails.timestamp}</div>
                    {experimentDetails.status === "ERROR" && experimentDetails.outputs?.error_details && (
                      <div className="col-span-2 mt-2">
                        <div className="text-red-600 font-medium">Error Details:</div>
                        <div className="bg-red-50 text-red-800 p-3 rounded-md mt-1">
                          {experimentDetails.outputs.error_details}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {experimentDetails.parameters && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Configuration</h3>
                    <div className="space-y-2">
                      <Collapsible
                        open={isSystemPromptOpen}
                        onOpenChange={setIsSystemPromptOpen}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">System Prompt</h4>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-9 p-0">
                              <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  isSystemPromptOpen ? "" : "-rotate-90"
                                }`}
                              />
                              <span className="sr-only">Toggle system prompt</span>
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="space-y-2">
                          <div className="bg-muted/50 p-2 rounded-md whitespace-pre-wrap">
                            {experimentDetails.parameters.system_prompt}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <Collapsible
                        open={isUserPromptOpen}
                        onOpenChange={setIsUserPromptOpen}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">User Prompt</h4>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-9 p-0">
                              <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  isUserPromptOpen ? "" : "-rotate-90"
                                }`}
                              />
                              <span className="sr-only">Toggle user prompt</span>
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="space-y-2">
                          <div className="bg-muted/50 p-2 rounded-md whitespace-pre-wrap">
                            {experimentDetails.parameters.user_prompt}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                )}

                {experimentDetails.outputs && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Results</h3>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[150px]">Metric</TableHead>
                            {Array.from(new Set(
                              Object.keys(experimentDetails.outputs)
                                .map(key => key.split('_')[0])
                            )).map((model, index) => (
                              <TableHead key={index}>{model}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Time (seconds)</TableCell>
                            {Array.from(new Set(
                              Object.keys(experimentDetails.outputs)
                                .map(key => key.split('_')[0])
                            )).map((model, index) => (
                              <TableCell key={index}>
                                {Number(experimentDetails.outputs[`${model}_elapsed_time`]).toFixed(2)}s
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Total Tokens</TableCell>
                            {Array.from(new Set(
                              Object.keys(experimentDetails.outputs)
                                .map(key => key.split('_')[0])
                            )).map((model, index) => (
                              <TableCell key={index}>
                                {experimentDetails.outputs[`${model}_total_tokens`]}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Input Tokens</TableCell>
                            {Array.from(new Set(
                              Object.keys(experimentDetails.outputs)
                                .map(key => key.split('_')[0])
                            )).map((model, index) => (
                              <TableCell key={index}>
                                {experimentDetails.outputs[`${model}_input_tokens`]}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Output Tokens</TableCell>
                            {Array.from(new Set(
                              Object.keys(experimentDetails.outputs)
                                .map(key => key.split('_')[0])
                            )).map((model, index) => (
                              <TableCell key={index}>
                                {experimentDetails.outputs[`${model}_output_tokens`]}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium align-top pt-4">Response</TableCell>
                            {Array.from(new Set(
                              Object.keys(experimentDetails.outputs)
                                .map(key => key.split('_')[0])
                            )).map((model, index) => (
                              <TableCell key={index} className="align-top pt-4">
                                {isValidJson(experimentDetails.outputs[`${model}_response`]) ? (
                                  <Tabs defaultValue="json" className="w-full">
                                    <TabsList className="w-full justify-start">
                                      <TabsTrigger value="json">JSON</TabsTrigger>
                                      <TabsTrigger value="graph">Graph</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="json">
                                      <pre className="bg-muted/50 p-2 rounded-md whitespace-pre-wrap overflow-auto max-h-[400px]">
                                        {JSON.stringify(JSON.parse(experimentDetails.outputs[`${model}_response`].trim()), null, 2)}
                                      </pre>
                                    </TabsContent>
                                    <TabsContent value="graph">
                                      <div className="border rounded-md p-4">
                                        <JsonGraph 
                                          data={JSON.parse(experimentDetails.outputs[`${model}_response`].trim())}
                                          height={400}
                                          width={600}
                                        />
                                      </div>
                                    </TabsContent>
                                  </Tabs>
                                ) : (
                                  <div className="bg-muted/50 p-2 rounded-md whitespace-pre-wrap">
                                    {experimentDetails.outputs[`${model}_response`]}
                                  </div>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </ScrollArea>
          <DialogFooter>
            <Button onClick={handleRunAgain}>
              Run Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 