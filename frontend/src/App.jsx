import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import JobDetails from './pages/JobDetails';
import EmployeeDashboard from './pages/EmployeeDashboard';
import PosterDashboard from './pages/PosterDashboard';
import PostJob from './pages/PostJob';
import JobApplicants from './pages/JobApplicants';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/poster"
          element={
            <ProtectedRoute role="poster">
              <PosterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-job"
          element={
            <ProtectedRoute role="poster">
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/applicants"
          element={
            <ProtectedRoute role="poster">
              <JobApplicants />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
