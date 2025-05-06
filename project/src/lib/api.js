import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/auth';
      }
      throw new Error(error.response.data?.message || 'Server error occurred');
    } else if (error.request) {
      throw new Error('Server is not responding. Please try again later.');
    }
    throw new Error('Request failed. Please check your connection.');
  }
);

export const apiService = {
  // Auth
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  register: async (userData) => {
    const { email, password, firstName, lastName, address, birthday, avatarUrl } = userData;
    return await api.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      address,
      birthday,
      avatarUrl
    });
  },

  // User Profile
  getAllUsers: async () => {
    return await api.get('/users');
  },

  getPublicProfile: async (userId) => {
    return await api.get(`/users/${userId}`);
  },

  getPrivateProfile: async (userId) => {
    return await api.get(`/users/${userId}/private`);
  },

  updateProfile: async (userId, userData) => {
    return await api.put(`/users/${userId}`, userData);
  },

  deleteProfile: async (userId) => {
    return await api.delete(`/users/${userId}`);
  },

  followUser: async (userId) => {
    return await api.post(`/users/${userId}/follow`);
  },

  unfollowUser: async (userId) => {
    return await api.delete(`/users/${userId}/follow`);
  },

  getFollowers: async (userId) => {
    return await api.get(`/users/${userId}/followers`);
  },

  getFollowing: async (userId) => {
    return await api.get(`/users/${userId}/following`);
  },

  // Media
  uploadMedia: async (file, description) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    try {
      const response = await axios.post('/api/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to upload media');
      }
      throw new Error('Failed to upload media');
    }
  },

  // Posts
  getPosts: async () => {
    return await api.get('/posts');
  },

  getPost: async (id) => {
    return await api.get(`/posts/${id}`);
  },

  createPost: async (postData) => {
    return await api.post('/posts', postData);
  },

  updatePost: async (id, postData) => {
    return await api.put(`/posts/${id}`, postData);
  },

  deletePost: async (id) => {
    return await api.delete(`/posts/${id}`);
  },

  // Comments
  getComments: async (postId) => {
    return await api.get(`/posts/${postId}/comments`);
  },

  createComment: async (postId, commentData) => {
    return await api.post(`/posts/${postId}/comments`, commentData);
  },

  updateComment: async (postId, commentId, commentData) => {
    return await api.put(`/posts/${postId}/comments/${commentId}`, commentData);
  },

  deleteComment: async (postId, commentId) => {
    return await api.delete(`/posts/${postId}/comments/${commentId}`);
  },

  // Likes
  getLikes: async (postId) => {
    return await api.get(`/posts/${postId}/likes`);
  },

  likePost: async (postId) => {
    return await api.post(`/posts/${postId}/likes`);
  },

  unlikePost: async (postId) => {
    return await api.delete(`/posts/${postId}/likes`);
  },

  // Learning Plans
  getLearningPlans: async (params) => {
    return await api.get('/learning-plans', { params });
  },

  getMyLearningPlans: async () => {
    return await api.get('/learning-plans/my-plans');
  },

  getLearningPlan: async (id) => {
    return await api.get(`/learning-plans/${id}`);
  },

  createLearningPlan: async (planData) => {
    return await api.post('/learning-plans', planData);
  },

  updateLearningPlan: async (id, planData) => {
    return await api.put(`/learning-plans/${id}`, planData);
  },

  deleteLearningPlan: async (id) => {
    return await api.delete(`/learning-plans/${id}`);
  },

  getNotifications: async (unreadOnly = false) => {
    return await api.get('/notifications', { params: { unreadOnly } });
  },

  getUnreadNotificationCount: async () => {
    return await api.get('/notifications/unread-count');
  },

  markNotificationAsRead: async (notificationId) => {
    return await api.put(`/notifications/${notificationId}/read`);
  },

  markAllNotificationsAsRead: async () => {
    return await api.put('/notifications/read-all');
  },
};

export default apiService;
export { api };