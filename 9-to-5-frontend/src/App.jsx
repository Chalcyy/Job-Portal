import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateProfile from './pages/candidate/CandidateProfile';
import MyApplications from './pages/candidate/MyApplications';
import RecommendedJobs from './pages/candidate/RecommendedJobs';
import CompanyDashboard from './pages/company/CompanyDashboard';
import PostJob from './pages/company/PostJob';
import EditJob from './pages/company/EditJob';
import JobApplications from './pages/company/JobApplications';
import CompanyProfile from './pages/company/CompanyProfile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route
              path="profile"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <CandidateProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="applications"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <MyApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="recommended"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <RecommendedJobs />
                </ProtectedRoute>
              }
            />

            <Route
              path="company/dashboard"
              element={
                <ProtectedRoute allowedRole="company">
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="company/jobs/new"
              element={
                <ProtectedRoute allowedRole="company">
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="company/jobs/:id/edit"
              element={
                <ProtectedRoute allowedRole="company">
                  <EditJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="company/jobs/:id/applications"
              element={
                <ProtectedRoute allowedRole="company">
                  <JobApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="company/profile"
              element={
                <ProtectedRoute allowedRole="company">
                  <CompanyProfile />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
