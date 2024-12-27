import { Experiment, ExperimentDetails } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown } from "lucide-react";
import { JsonGraph } from "@/components/JsonGraph";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

function isValidJson(str: string): boolean {
  try {
    JSON.parse(str.trim());
    return true;
  } catch {
    return false;
  }
}

interface ExperimentDetailsDialogProps {
  experiment: Experiment | null;
  experimentDetails?: ExperimentDetails | null;
  isLoading?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRunAgain?: (experiment: Experiment) => void;
  status?: string;
  statusUpdates?: string[];
}

export function ExperimentDetailsDialog({
  experiment,
  experimentDetails,
  isLoading,
  isOpen,
  onOpenChange,
  onRunAgain,
  status,
  statusUpdates = [],
}: ExperimentDetailsDialogProps) {
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(true);
  const [isUserPromptOpen, setIsUserPromptOpen] = useState(true);

  const handleRunAgain = () => {
    if (experimentDetails && onRunAgain) {
      onRunAgain(experiment!);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{experiment?.name || 'Experiment Details'}</DialogTitle>
          <DialogDescription>
            {experiment?.description}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          {isLoading ? (
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

              {/* Status Updates for Running Experiments */}
              {status === "running" && statusUpdates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Progress</h3>
                  <div className="space-y-2 bg-muted/50 p-3 rounded-md">
                    {statusUpdates.map((update, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {index === statusUpdates.length - 1 && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        <span>{update}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
          {onRunAgain && (
            <Button onClick={handleRunAgain}>
              Run Again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 