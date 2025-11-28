import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import IngestPage from './pages/IngestPage'
import AlertsPage from './pages/AlertsPage'
import ActivityPage from './pages/ActivityPage'
import ChatbotPage from './pages/ChatbotPage'
import SimulatorPage from './pages/SimulatorPage'
import InsightsPage from './pages/InsightsPage'

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ingest" element={<IngestPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/chat" element={<ChatbotPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/insights" element={<InsightsPage />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}

export default App
