import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { OtherProfile } from './pages/OtherProfile';
import { Users } from './pages/Users';
import { CreatePost } from './pages/CreatePost';
import { LearningPlans } from './pages/LearningPlans';
import { CreateLearningPlan } from './pages/CreateLearningPlan';
import { EditLearningPlan } from './pages/EditLearningPlan';
import { LearningPlanDetails } from './pages/LearningPlanDetails';
import { Auth } from './pages/Auth';
import { useAuthStore } from './store/authStore';
import PropTypes from 'prop-types';

function ProtectedRoute({ children }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile/:userId"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="otherprofile/:userId"
            element={
              <ProtectedRoute>
                <OtherProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="create-post"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route path="learning-plans">
            <Route index element={<LearningPlans />} />
            <Route
              path="create"
              element={
                <ProtectedRoute>
                  <CreateLearningPlan />
                </ProtectedRoute>
              }
            />
            <Route path=":id" element={<LearningPlanDetails />} />
            <Route
              path=":id/edit"
              element={
                <ProtectedRoute>
                  <EditLearningPlan />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;