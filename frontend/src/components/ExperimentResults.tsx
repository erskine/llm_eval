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
import { Loader2 } from "lucide-react";
import { Experiment } from "@/types/api";
import { useExperimentContext } from "@/context/ExperimentContext";
import { ExperimentDetailsDialog } from "@/components/ExperimentDetailsDialog";

export function ExperimentResults({ onRunAgain }: { onRunAgain?: (experiment: Experiment) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: experiments = [], isLoading, error } = useExperiments();
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const { data: experimentDetails, isLoading: isLoadingDetails } = useExperimentDetails(
    selectedExperiment?.id ?? null
  );
  const { setSelectedExperiment: setContextExperiment } = useExperimentContext();

  const handleExperimentClick = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
  };

  const handleRunAgain = (experiment: Experiment) => {
    setContextExperiment({
      ...experiment,
      parameters: experimentDetails!.parameters
    });
    setSelectedExperiment(null);
    if (onRunAgain) {
      onRunAgain(experiment);
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

      <ExperimentDetailsDialog
        experiment={selectedExperiment}
        experimentDetails={experimentDetails}
        isLoading={isLoadingDetails}
        isOpen={selectedExperiment !== null}
        onOpenChange={(open) => !open && setSelectedExperiment(null)}
        onRunAgain={handleRunAgain}
      />
    </div>
  );
} 