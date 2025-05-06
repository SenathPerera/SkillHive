import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Home, BookOpen, PlusCircle, User, LogOut, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { NotificationBell } from './NotificationBell';

export function Layout() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary-600">SkillHive</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link to="/" className="flex items-center px-2 py-2 text-gray-700 hover:text-primary-600">
                  <Home className="h-5 w-5" />
                  <span className="ml-2">Home</span>
                </Link>
                <Link to="/learning-plans" className="flex items-center px-2 py-2 text-gray-700 hover:text-primary-600">
                  <BookOpen className="h-5 w-5" />
                  <span className="ml-2">Learning Plans</span>
                </Link>
                {user && (
                  <Link to="/users" className="flex items-center px-2 py-2 text-gray-700 hover:text-primary-600">
                    <Users className="h-5 w-5" />
                    <span className="ml-2">Users</span>
                  </Link>
                )}
              </div>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <Link
                  to="/create-post"
                  className="flex items-center px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create Post
                </Link>
                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center text-gray-700 hover:text-primary-600"
                >
                  <User className="h-5 w-5" />
                  <span className="ml-2">Profile</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-gray-700 hover:text-primary-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-2">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}