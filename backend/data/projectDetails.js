export const projectDetails = {

  'DAR (Detection and Recognition System)': {
    technologies: [
      'Python',
      'Machine Learning',
      'Computer Vision',
      'OpenCV'
    ],
    features: [
      'Text detection from images',
      'Object detection',
      'Face detection',
      'Image processing'
    ],
    type: 'AI-Based System Application',
    category: 'AI/ML, Computer Vision',
    developedIn: '2021',
    projectNature: 'Diploma Final Year Project',
    teamSize: 6,
    isIndividual: false,
    teamLead: null,
    additionalInfo:
      'An AI-based system developed as a diploma final year project to perform detection and recognition tasks on images. This was a team project with 6 members.',
    howItWorks:
      'The system takes an image as input and preprocesses it using OpenCV. Machine learning–based computer vision techniques are then applied to detect text, objects, and faces. The detected results are processed and displayed to the user.'
  },

  'Learning with AR': {
    technologies: [
      'Unity',
      'Vuforia',
      'C#'
    ],
    features: [
      'Augmented Reality learning',
      'Interactive 3D models',
      'Marker-based AR'
    ],
    type: 'AR Mobile Application',
    category: 'Education, AR/VR',
    developedIn: '2024',
    projectNature: 'B.Tech Final Year Project',
    teamSize: 3,
    isIndividual: false,
    teamLead: 'Syed Bakhtawar',
    additionalInfo:
      'An educational augmented reality application designed to enhance learning through interactive content. This was a team project with 3 members, led by Syed Bakhtawar.',
    howItWorks:
      'The application uses Vuforia to recognize predefined markers through the camera. Once a marker is detected, Unity renders the associated 3D model on the screen, allowing users to visualize and interact with educational content in real time.'
  },

  'Obliviate': {
    technologies: [
      'Unity',
      'C#'
    ],
    features: [
      '3D gameplay',
      'Level-based challenges',
      'Player movement and collision handling'
    ],
    type: '3D Game',
    category: 'Gaming',
    developedIn: '2019',
    projectNature: 'Diploma 2nd Year Project',
    teamSize: 4,
    isIndividual: false,
    teamLead: null,
    additionalInfo:
      'A Unity-based 3D game created during diploma studies to understand core game development concepts. This was a team project with 4 members.',
    howItWorks:
      'The game logic is implemented using C# scripts. Unity handles rendering and physics, while scripts manage player movement, collisions, scoring, and level progression.'
  },

  'Fruit Slicer': {
    technologies: [
      'Unity',
      'C#'
    ],
    features: [
      'Slicing mechanics',
      'Score tracking system',
      '2D physics'
    ],
    type: '2D Game',
    category: 'Gaming',
    developedIn: '2021',
    projectNature: 'Self-Learning / Practice Project',
    teamSize: 1,
    isIndividual: true,
    teamLead: null,
    additionalInfo:
      'A 2D Unity game developed as a learning project to practice basic game mechanics. This was an individual project developed by Syed Abbas.',
    howItWorks:
      'The game detects interactions with game objects and applies slicing logic using Unity’s 2D physics system. When a slice action is detected, the object is split, effects are triggered, and the score is updated.'
  },

  'Apna Super Bazar': {
    technologies: [
      'HTML',
      'CSS',
      'JavaScript'
    ],
    features: [
      'Product listing',
      'Basic cart functionality',
      'Responsive UI'
    ],
    type: 'E-commerce Website',
    category: 'Web Development',
    developedIn: '2020',
    projectNature: 'Diploma Mini Project (3rd Year)',
    teamSize: 3,
    isIndividual: false,
    teamLead: null,
    additionalInfo:
      'A frontend-based e-commerce mini project developed during diploma studies. This was a team project with 3 members.',
    howItWorks:
      'The website displays products using HTML and CSS. JavaScript is used to manage user interactions such as adding products to the cart and updating quantities dynamically.'
  },

  'Healthease': {
    technologies: [
      'Java',
      'Android Studio',
      'SQLite'
    ],
    features: [
      'Appointment booking',
      'Lab test scheduling',
      'Local data storage'
    ],
    type: 'Android Mobile Application',
    category: 'Healthcare, Mobile',
    developedIn: '2023',
    projectNature: 'B.Tech Mini Project',
    teamSize: 1,
    isIndividual: true,
    teamLead: null,
    additionalInfo:
      'A healthcare mobile application designed to simplify appointment and lab test booking. This was an individual project developed by Syed Abbas.',
    howItWorks:
      'Users enter their details and select healthcare services within the app. The data is stored locally using SQLite, allowing efficient data management and offline access.'
  },

  'Bigg Boss – App Room': {
    technologies: [
      'Unity',
      'C#',
      'React.js',
      'Node.js',
      'Express.js',
      'Socket.IO',
      'REST APIs',
      'Multer'
    ],
    features: [
      'Real-time touchscreen interaction',
      'Backend-driven option flow',
      'Multi-layer decision system',
      'Media playback (video, image, audio)'
    ],
    type: 'Touchscreen Interactive Application',
    category: 'Entertainment, Real-Time Systems',
    developedIn: '2025',
    projectNature: 'Office / Production Project',
    teamSize: 2,
    isIndividual: false,
    teamLead: null,
    additionalInfo:
      'A real-time interactive touchscreen application developed for Bigg Boss Season 19. This was a team project with 2 members.',
    howItWorks:
      'When a user interacts with the touchscreen, Unity sends a real-time request to the backend via Socket.IO. The backend dynamically responds with options. Based on user selections, the system progresses through multiple layers, and finally plays media content such as video, image, or audio.'
  },

  'Party Room': {
    technologies: [
      'React',
      'Vite',
      'Firebase',
      'Socket.IO',
      'WebSockets',
      'YouTube IFrame API'
    ],
    features: [
      'Synchronized video playback',
      'Host-controlled play and pause',
      'Room creation and invitations',
      'Friend request system'
    ],
    type: 'Real-Time Web Application',
    category: 'Streaming, Social',
    developedIn: '2025 – Present',
    projectNature: 'Personal Project',
    teamSize: 1,
    isIndividual: true,
    teamLead: null,
    additionalInfo:
      'A real-time web application that allows users to watch videos together in sync. This was an individual project developed by Syed Abbas.',
    howItWorks:
      'A host creates a room and shares an invite. Playback actions from the host are sent to the server using Socket.IO and broadcast to all participants, ensuring synchronized video playback for everyone.'
  }

};
