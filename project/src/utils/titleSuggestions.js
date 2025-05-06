export const generateTitleSuggestions = (topic) => {
    const templates = [
      "Beginner's Guide to {topic}",
      "Mastering {topic} in 7 Days",
      "Top 10 Tips to Learn {topic} Fast",
      "Everything You Need to Know About {topic}",
      "My Journey Learning {topic}",
    ];
    return templates.map(t => t.replace('{topic}', topic));
  };
  