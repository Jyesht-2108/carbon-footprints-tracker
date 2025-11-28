import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import PrivateRoute from './components/auth/PrivateRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import IngestPage from './pages/IngestPage'
import AlertsPage from './pages/AlertsPage'
import ActivityPage from './pages/ActivityPage'
import ChatbotPage from './pages/ChatbotPage'
import SimulatorPage from './pages/SimulatorPage'
import InsightsPage from './pages/InsightsPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/ingest" element={
            <PrivateRoute>
              <Layout>
                <IngestPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/alerts" element={
            <PrivateRoute>
              <Layout>
                <AlertsPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/simulator" element={
            <PrivateRoute>
              <Layout>
                <SimulatorPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute>
              <Layout>
                <ChatbotPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/activity" element={
            <PrivateRoute>
              <Layout>
                <ActivityPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/insights" element={
            <PrivateRoute>
              <Layout>
                <InsightsPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </PrivateRoute>
          } />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
