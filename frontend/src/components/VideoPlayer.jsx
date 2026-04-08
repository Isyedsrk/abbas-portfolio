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
  1: bbSR, // Biggboss Interactive Touchscreen System
  3: learningWithAR, // Learning with AR
  4: obliviate, // Obliviate
  5: fruitSlicer, // Fruit-Slicer
  6: apnaSuperBazaar, // Apna super bazaar
  7: healthease, // Healthease
};

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoSrc, setVideoSrc] = useState('');
  const [projectTitle, setProjectTitle] = useState('');

  useEffect(() => {
    const projectTitles = {
      1: 'Biggboss Interactive Touchscreen System',
      2: 'Party Room',
      3: 'Learning with AR',
      4: 'Obliviate',
      5: 'Fruit-Slicer',
      6: 'Apna super bazaar',
      7: 'Healthease',
      8: 'DAR',
    };

    if (!id || !localVideoMappings[id]) {
      if (id === '2' || id === '8') {
        setProjectTitle(projectTitles[id] || 'Project Video');
        return;
      }
      navigate('/Project');
      return;
    }

    setVideoSrc(localVideoMappings[id]);
    setProjectTitle(projectTitles[id] || 'Project Video');
  }, [id, navigate]);

  const back = () => navigate('/Project');

  if (id === '2' || id === '8') {
    return (
      <section className="video-page">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="video-page-shell">
            <header className="video-page-header">
              <p className="video-page-eyebrow mb-2">Portfolio</p>
              <h1 className="video-page-title">{projectTitle}</h1>
              <p className="video-page-subtitle">Video glimpse</p>
            </header>
            <div className="video-page-body video-page-body--empty p-4 p-md-5 text-center">
              <div className="video-page-soon mx-auto">
                <h2 className="video-page-soon-title h4 text-primary mb-3">
                  Video coming soon
                </h2>
                <p className="video-page-soon-text mb-0">
                  A walkthrough for <strong>{projectTitle}</strong> is on the way.
                </p>
              </div>
            </div>
            <footer className="video-page-footer">
              <button
                type="button"
                className="btn btn-primary text-dark fw-semibold px-4"
                onClick={back}
              >
                Back to projects
              </button>
            </footer>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="video-page">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="video-page-shell">
          <header className="video-page-header">
            <p className="video-page-eyebrow mb-2">Portfolio</p>
            <h1 className="video-page-title">{projectTitle}</h1>
            <p className="video-page-subtitle">Video glimpse</p>
          </header>
          <div className="video-page-body p-0 bg-black">
            <div className="ratio ratio-16x9">
              <video
                src={videoSrc}
                title={`${projectTitle} video`}
                controls
                className="w-100 h-100"
                style={{
                  objectFit: 'contain',
                  backgroundColor: '#000',
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          <footer className="video-page-footer">
            <button
              type="button"
              className="btn btn-primary text-dark fw-semibold px-4"
              onClick={back}
            >
              Back to projects
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
};

export default VideoPlayer;
