import { ThemeProvider } from "@/components/theme-provider"
import { ExperimentForm } from "@/components/ExperimentForm"
import { ExperimentResults } from "@/components/ExperimentResults"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExperimentProvider } from "@/context/ExperimentContext"
import { TabProvider, useTabContext } from "@/context/TabContext"
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"

function AppContent() {
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useTabContext();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(value === "create" ? "/" : "/results");
  };

  const handleRunAgain = () => {
    setActiveTab("create");
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full max-w-[90%] mx-auto p-4">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">
          LLM Experiment Lab
        </h1>
        
        <div className="max-w-3xl mx-auto">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Experiment</TabsTrigger>
              <TabsTrigger value="results">View Results</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <ExperimentForm />
            </TabsContent>
            <TabsContent value="results">
              <ExperimentResults onRunAgain={handleRunAgain} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ExperimentProvider>
        <TabProvider>
          <Router>
            <Routes>
              <Route path="/" element={<AppContent />} />
              <Route path="/results" element={<AppContent />} />
            </Routes>
          </Router>
        </TabProvider>
      </ExperimentProvider>
    </ThemeProvider>
  )
}

export default App
