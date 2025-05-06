export const generateContentSuggestions = (topic) => {
    if (!topic || topic.length < 3) return [];
  
    const templates = [
      "In this post, I’ll walk you through my experience with {topic}.",
      "Here’s what I learned while practicing {topic}.",
      "These are my key takeaways from working on {topic}.",
      "Let’s explore how I approached {topic} and what worked.",
      "This is my journey mastering {topic}.",
    ];
  
    return templates.map(t => t.replace('{topic}', topic));
  };
  