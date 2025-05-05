import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import PropTypes from 'prop-types';

//Displays a list of posts with basic info and formatting
export function PostList({ posts }) {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg font-medium text-blue-600">
                {post.userId[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
        </div>
      ))}
    </div>
  );
}

// Type-checking with PropTypes to enforce expected structure for posts
PostList.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    })
  ).isRequired,
};