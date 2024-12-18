import { ThemeProvider } from "@/components/theme-provider"
import { ExperimentForm } from "@/components/ExperimentForm"
import { ThemeToggle } from "@/components/theme-toggle"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="experiment-ui-theme">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <ExperimentForm />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
