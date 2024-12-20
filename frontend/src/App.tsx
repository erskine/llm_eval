import { ThemeProvider } from "@/components/theme-provider"
import { ExperimentForm } from "@/components/ExperimentForm"
import { ThemeToggle } from "@/components/theme-toggle"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen w-full bg-background">
        <div className="w-full max-w-[90%] mx-auto p-4">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold text-center mb-8">
            LLM Experiment Lab
          </h1>
          <ExperimentForm />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
