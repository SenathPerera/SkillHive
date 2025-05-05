import PropTypes from 'prop-types';

export const MediaItemShape = {
  url: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['image', 'video']).isRequired,
  description: PropTypes.string,
};

export const ProjectDetailsShape = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['in_progress', 'completed']).isRequired,
  githubUrl: PropTypes.string,
};

export const CertificationDetailsShape = {
  name: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
  completionDate: PropTypes.string.isRequired,
  credentialUrl: PropTypes.string,
};

export const ProgressTemplateShape = {
  type: PropTypes.oneOf(['tutorial', 'skill', 'project', 'certification']).isRequired,
  completed: PropTypes.arrayOf(PropTypes.string),
  skillsLearned: PropTypes.arrayOf(PropTypes.string),
  projectDetails: PropTypes.shape(ProjectDetailsShape),
  certificationDetails: PropTypes.shape(CertificationDetailsShape),
};

export const PostShape = {
  id: PropTypes.string.isRequired,
  user_id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  media: PropTypes.arrayOf(PropTypes.shape(MediaItemShape)),
  type: PropTypes.oneOf(['skill_share', 'progress_update']).isRequired,
  template: PropTypes.shape(ProgressTemplateShape),
  created_at: PropTypes.string.isRequired,
  updated_at: PropTypes.string.isRequired,
};

export const CommentShape = {
  id: PropTypes.string.isRequired,
  user_id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
};

export const LikeShape = {
  id: PropTypes.string.isRequired,
  user_id: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
};

export const UserShape = {
  id: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  full_name: PropTypes.string.isRequired,
  avatar_url: PropTypes.string,
  bio: PropTypes.string,
  created_at: PropTypes.string.isRequired,
  updated_at: PropTypes.string.isRequired,
};

export const LearningPlanShape = {
  id: PropTypes.string.isRequired,
  user_id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  goals: PropTypes.arrayOf(PropTypes.string).isRequired,
  timeline: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['not_started', 'in_progress', 'completed']).isRequired,
  created_at: PropTypes.string.isRequired,
  updated_at: PropTypes.string.isRequired,
};