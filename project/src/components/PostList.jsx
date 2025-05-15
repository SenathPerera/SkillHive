import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import PropTypes from 'prop-types';

export function PostList({ posts }) {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 transition hover:shadow-md"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-lg">
              {post.userId[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">{post.title}</h3>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>
      ))}
    </div>
  );
}

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
