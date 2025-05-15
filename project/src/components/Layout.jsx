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
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left: Brand & Navigation */}
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                SkillHive
              </Link>
              <div className="hidden sm:flex space-x-4 text-sm font-medium">
                <Link
                  to="/"
                  className="flex items-center text-gray-600 hover:text-blue-600 transition"
                >
                  <Home className="h-5 w-5" />
                  <span className="ml-2">Home</span>
                </Link>
                <Link
                  to="/learning-plans"
                  className="flex items-center text-gray-600 hover:text-blue-600 transition"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="ml-2">Learning Plans</span>
                </Link>
                {user && (
                  <Link
                    to="/users"
                    className="flex items-center text-gray-600 hover:text-blue-600 transition"
                  >
                    <Users className="h-5 w-5" />
                    <span className="ml-2">Users</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <NotificationBell />
                  <Link
                    to="/create-post"
                    className="flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Create Post
                  </Link>
                  <Link
                    to={`/profile/${user.id}`}
                    className="flex items-center text-gray-600 hover:text-blue-600 transition"
                  >
                    <User className="h-5 w-5" />
                    <span className="ml-2">Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center text-gray-600 hover:text-blue-600 transition"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="ml-2">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition text-sm font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
