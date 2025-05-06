import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Award, ChevronLeft, Loader2, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../lib/api';

export function LearningPlanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getLearningPlan(id);
        setPlan(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch learning plan');
        console.error('Error fetching learning plan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiService.deleteLearningPlan(id);
      navigate('/learning-plans', { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete learning plan');
      console.error('Error deleting learning plan:', error);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading learning plan...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/learning-plans')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Learning Plans
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-gray-600 mb-4">Learning plan not found</div>
          <button
            onClick={() => navigate('/learning-plans')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Learning Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/learning-plans')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Learning Plans
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {plan.thumbnail && (
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={`/api/media/${plan.thumbnail}`}
                alt={plan.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{plan.title}</h1>
              {user?.id === plan.userId && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/learning-plans/${plan.id}/edit`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Plan
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {plan.skill}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {plan.skillLevel.charAt(0).toUpperCase() + plan.skillLevel.slice(1)}
              </span>
              <span className="flex items-center text-gray-500 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {plan.duration}
              </span>
            </div>

            <p className="text-gray-600 mb-8">{plan.description}</p>

            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Lessons</h2>
              <div className="space-y-6">
                {plan.lessons.map((lesson, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-6"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                          {index + 1}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="mt-1 text-gray-600">
                            {lesson.description}
                          </p>
                        )}
                        {lesson.videoId && (
                          <div className="mt-4 aspect-w-16 aspect-h-9">
                            <video
                              src={`/api/media/${lesson.videoId}`}
                              controls
                              className="rounded-lg"
                              preload="metadata"
                            />
                          </div>
                        )}
                        {lesson.documentIds && lesson.documentIds.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Additional Resources
                            </h4>
                            <div className="space-y-2">
                              {lesson.documentIds.map((docId, docIndex) => (
                                <a
                                  key={docIndex}
                                  href={`/api/media/${docId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-600 hover:text-blue-800"
                                >
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  Resource {docIndex + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Learning Plan
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this learning plan? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}