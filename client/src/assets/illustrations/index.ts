// This file exports SVG illustrations for the smart learning platform
// We're using public CDN URLs for images to avoid binary files

export const illustrations = {
  // Learning Styles
  storyBasedLearning: "https://cdn.pixabay.com/photo/2016/10/30/05/43/reading-1782242_1280.jpg",
  theoryBasedLearning: "https://cdn.pixabay.com/photo/2017/05/15/23/47/education-2316268_1280.jpg",
  practicalBasedLearning: "https://cdn.pixabay.com/photo/2020/01/20/20/58/programming-4781761_1280.jpg",
  
  // General Education
  onlineLearning: "https://cdn.pixabay.com/photo/2018/05/19/00/53/online-3412473_1280.jpg",
  studentDashboard: "https://cdn.pixabay.com/photo/2016/11/19/14/16/coffee-1839138_1280.jpg",
  aiTutor: "https://cdn.pixabay.com/photo/2019/04/15/11/47/artificial-intelligence-4129650_1280.jpg",
  communityLearning: "https://cdn.pixabay.com/photo/2017/07/31/11/14/laptop-2557468_1280.jpg",
  
  // Course Domains
  webDevelopment: "https://cdn.pixabay.com/photo/2016/11/23/14/45/coding-1853305_1280.jpg",
  artificialIntelligence: "https://cdn.pixabay.com/photo/2017/04/23/19/30/artificial-intelligence-2254706_1280.jpg",
  cybersecurity: "https://cdn.pixabay.com/photo/2017/01/19/07/55/cyber-security-1991324_1280.jpg",
  dataScience: "https://cdn.pixabay.com/photo/2017/01/17/12/41/analytics-1986901_1280.jpg",
  mobileDevelopment: "https://cdn.pixabay.com/photo/2017/01/04/20/15/mobile-application-1953143_1280.jpg",
  
  // Learning Elements
  quiz: "https://cdn.pixabay.com/photo/2016/10/14/15/19/quiz-1740381_1280.jpg",
  certificate: "https://cdn.pixabay.com/photo/2016/10/10/22/38/certificate-1730155_1280.jpg",
  achievement: "https://cdn.pixabay.com/photo/2017/01/28/11/43/cup-2015198_1280.jpg",
  progress: "https://cdn.pixabay.com/photo/2017/06/09/16/12/boat-2387226_1280.jpg",
  
  // Decorative
  heroPattern: "https://cdn.pixabay.com/photo/2020/04/08/08/08/spring-5016266_1280.jpg",
  loginBackground: "https://cdn.pixabay.com/photo/2022/08/19/10/35/mountains-7396224_1280.jpg"
};

// Helper function to get illustration by category and type
export function getIllustration(category: string, type?: string): string {
  if (category === 'learningStyle') {
    switch (type) {
      case 'story-based':
        return illustrations.storyBasedLearning;
      case 'theory-based':
        return illustrations.theoryBasedLearning;
      case 'practical-based':
        return illustrations.practicalBasedLearning;
      default:
        return illustrations.onlineLearning;
    }
  }
  
  if (category === 'domain') {
    switch (type) {
      case 'Web Development':
        return illustrations.webDevelopment;
      case 'Artificial Intelligence':
        return illustrations.artificialIntelligence;
      case 'Cybersecurity':
        return illustrations.cybersecurity;
      case 'Data Science':
        return illustrations.dataScience;
      case 'Mobile Development':
        return illustrations.mobileDevelopment;
      default:
        return illustrations.onlineLearning;
    }
  }
  
  // Return general illustration if no specific match
  return illustrations.onlineLearning;
}

export default illustrations;
