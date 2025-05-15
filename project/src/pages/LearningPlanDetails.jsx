import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Award, ChevronLeft, Loader2, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../lib/api';
import { PomodoroTimer } from '../components/PomodoroTimer';

export function LearningPlanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // track user progress
  const [progress, setProgress] = useState({ completedLessons: [] });
  const [enrolled, setEnrolled] = useState(false);

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

    // load existing progress
    apiService.getPlanProgress(id)
      .then(prog => {
        setProgress(prog);
        setEnrolled(true);
      })
      .catch(() => {
        setEnrolled(false);
      });
  }, [id]);

  const onStart = () => {
    apiService.enrollLearningPlan(id)
      .then(prog => {
        setProgress(prog);
        setEnrolled(true);
      })
      .catch(err => {
        console.error('Error enrolling in plan:', err);
        alert('Could not start plan. Please try again.');
      });
  };

  const toggleLesson = (idx) => {
    const newSet = new Set(progress.completedLessons);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    const updatedArray = Array.from(newSet);
    setProgress(prev => ({ ...prev, completedLessons: updatedArray }));
    apiService.updatePlanProgress(id, updatedArray)
      .then(updated => setProgress(updated))
      .catch(err => {
        console.error('Error updating progress:', err);
        alert('Failed to update lesson status.');
      });
  };

  const handleDelete = async () => {
    console.log('Attempting to delete plan with id:', id);
    try {
      setIsDeleting(true);
      const response = await apiService.deleteLearningPlan(id);
      console.log('Delete response:', response);
      setShowDeleteModal(false);
      navigate('/learning-plans', { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete learning plan');
      console.error('Error deleting learning plan:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/learning-plans')}
          className="flex items-center text-gray-700 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Learning Plans
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button
                    onClick={() => navigate(`/learning-plans/${plan.id}/edit`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Plan
                  </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-4 text-gray-600">
              <span className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                {plan.skillLevel.charAt(0).toUpperCase() + plan.skillLevel.slice(1)}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {plan.duration}
              </span>
            </div>

            <p className="text-gray-600 mb-8 mt-4">{plan.description}</p>

            {/* Start Plan button */}
            {user && !enrolled && (
              <button
                className="mb-8 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={onStart}
              >
                Start Plan
              </button>
            )}

            {/* Progress bar */}
            {enrolled && (
              <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="h-3 rounded-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        (progress.completedLessons.length / plan.lessons.length) * 100
                      )}%`
                    }}
                  />
                </div>
                <div className="text-sm text-gray-700 mb-4">
                  {Math.round(
                    (progress.completedLessons.length / plan.lessons.length) * 100
                  )}% complete
                </div>
                <button
                  className="mt-2 text-sm text-red-600 hover:underline"
                  onClick={async () => {
                    await apiService.deletePlanProgress(id);
                    setEnrolled(false);
                    setProgress({ completedLessons: [] });
                  }}
                >
                  Reset Progress
                </button>
              </div>
            )}

            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Lessons</h2>
              <div className="space-y-6">
                {plan.lessons.map((lesson, index) =>
                  enrolled ? (
                    <div key={index} className="flex flex-col space-y-3">
                    <label className="flex items-start space-x-3">
                      <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={progress.completedLessons.includes(index)}
                        onChange={() => toggleLesson(index)}
                        className="mt-1 h-5 w-5"
                        aria-label={`Mark lesson ${lesson.title} as complete`}
                      />
                      <div>
                        <h3 className="text-lg font-medium">{lesson.title}</h3>
                        {lesson.description && (
                          <p className="mt-1 text-gray-600">{lesson.description}</p>
                        )}

                        {lesson.videoId && (
                          lesson.videoId.startsWith('http') ? (
                            <p className="mt-4 text-blue-600">
                              <a
                                href={lesson.videoId}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                              >
                                View Video
                              </a>
                            </p>
                          ) : (
                            <div className="mt-4 aspect-w-16 aspect-h-9">
                              <video
                                src={`/api/media/${lesson.videoId}`}
                                controls
                                className="rounded-lg"
                                preload="metadata"
                              />
                            </div>
                          )
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
                                  <span className="underline">View Document</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      </div> 
                    </label>
                    <PomodoroTimer
                        lessonIndex={index}
                        planId={id}
                        onSessionComplete={(lessonIdx, seconds) => {
                          apiService.logTimeSpent(id, lessonIdx, seconds)
                          .catch(err => console.error('Failed to log time:', err));
                        }}
                      />
                      </div>
                  ) : (
                    <div key={index} className="flex items-start space-x-3">
                      <BookOpen className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <h3 className="text-lg font-medium">{lesson.title}</h3>
                        {lesson.description && (
                          <p className="mt-1 text-gray-600">{lesson.description}</p>
                        )}

                        {lesson.videoId && (
                          lesson.videoId.startsWith('http') ? (
                            <p className="mt-4 text-blue-600">
                              <a
                                href={lesson.videoId}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                              >
                                View Video
                              </a>
                            </p>
                          ) : (
                            <div className="mt-4 aspect-w-16 aspect-h-9">
                              <video
                                src={`/api/media/${lesson.videoId}`}
                                controls
                                className="rounded-lg"
                                preload="metadata"
                              />
                            </div>
                          )
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
                                  <span className="underline">View Document</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
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
