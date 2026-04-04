import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Import local video files
import learningWithAR from './videos/learningWithAR.mp4';
import obliviate from './videos/obliviate.mp4';
import fruitSlicer from './videos/fruit-slicer.mp4';
import apnaSuperBazaar from './videos/apna super bazaar.mp4';
import healthease from './videos/healthease.mp4';
import bbSR from './videos/BB_SR.mp4';

// Define local video sources
const localVideoMappings = {
  1: bbSR,               // Biggboss Interactive Touchscreen System
  3: learningWithAR,     // Learning with AR
  4: obliviate,          // Obliviate
  5: fruitSlicer,        // Fruit-Slicer
  6: apnaSuperBazaar,    // Apna super bazaar
  7: healthease          // Healthease
};

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoSrc, setVideoSrc] = useState('');
  const [projectTitle, setProjectTitle] = useState('');

  useEffect(() => {
    // Project titles
    const projectTitles = {
      1: "Biggboss Interactive Touchscreen System",
      2: "Party Room",
      3: "Learning with AR",
      4: "Obliviate",
      5: "Fruit-Slicer",
      6: "Apna super bazaar",
      7: "Healthease",
      8: "DAR"
    };
    
    if (!id || !localVideoMappings[id]) {
      // If DAR or Party Room project, show a message (since we don't have videos for them)
      if (id === '2' || id === '8') {
        setProjectTitle(projectTitles[id] || 'Project Video');
        return;
      }
      
      // For any other invalid ID, navigate back to projects
      navigate('/Project');
      return;
    }

    // Set the video source based on the project ID
    setVideoSrc(localVideoMappings[id]);
    setProjectTitle(projectTitles[id] || 'Project Video');
  }, [id, navigate]);

  // Special case for projects without videos (Party Room, DAR)
  if (id === '2' || id === '8') {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow video-player-card">
              <div className="card-header bg-warning text-dark">
                <h3 className="mb-0">{projectTitle} - Video Glimpse</h3>
              </div>
              <div className="card-body p-4 text-center">
                <div className="alert alert-info">
                  <h4>Video Coming Soon</h4>
                  <p>We&apos;re currently preparing a video demonstration for the {projectTitle} project.</p>
                </div>
              </div>
              <div className="card-footer">
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('/Project')}
                >
                  Back to Projects
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow video-player-card">
            <div className="card-header bg-warning text-dark">
              <h3 className="mb-0">{projectTitle} - Video Glimpse</h3>
            </div>
            <div className="card-body p-0">
              <div className="ratio ratio-16x9">
                <video
                  src={videoSrc}
                  title={`${projectTitle} video`}
                  controls
                  className="w-100 h-100"
                  style={{ 
                    objectFit: 'contain',
                    backgroundColor: '#000'
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            <div className="card-footer">
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/Project')}
              >
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 