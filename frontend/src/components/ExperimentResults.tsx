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
import { Loader2 } from "lucide-react";

export function ExperimentResults() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: experiments = [], isLoading, error } = useExperiments();

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
                  <TableRow key={experiment.id}>
                    <TableCell>{experiment.id}</TableCell>
                    <TableCell>{experiment.name}</TableCell>
                    <TableCell>{experiment.timestamp}</TableCell>
                    <TableCell>{experiment.status}</TableCell>
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
    </div>
  );
} 