import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import RecordListPage from './pages/RecordListPage'
import NewRecordPage from './pages/NewRecordPage'
import RecordDetailPage from './pages/RecordDetailPage'
import EditRecordPage from './pages/EditRecordPage'
import SearchPage from './pages/SearchPage'
import StatsPage from './pages/StatsPage'
import ProfilePage from './pages/ProfilePage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">加载中...</div>
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<HomePage />} />
            <Route path="records/:category" element={<RecordListPage />} />
            <Route path="records/new" element={<NewRecordPage />} />
            <Route path="record/:id" element={<RecordDetailPage />} />
            <Route path="records/edit/:id" element={<EditRecordPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
