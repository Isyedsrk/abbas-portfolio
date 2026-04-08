import obliviate from "./img/obliviate.png";
import AR from "./img/AR.jpeg";
import fs from "./img/fs.jpg";
import asb from "./img/asb.jpg";
import iconhe from "./img/iconhe.png";
import dar from "./img/dar.png";
import bb from "./img/bb.jpg";
import partyroom from "./img/partyroom.png";
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ProjectAiAssistantModal from "./ProjectAiAssistantModal";


const projects = [
  {
    id: 1,
    title: "Biggboss Interactive Touchscreen System",
    description: "A real-time interactive touchscreen system where an admin can remotely assign and control media-based tasks. The Unity touchscreen app displays the content and sends live user interaction data",
    thumbnail: bb,
    links: "https://github.com/Isyedsrk/Biggboss-Interactive-System"
  },
  {
    id: 2,
    title: "Party Room",
    description: "Party Room is a web application similar to Rave app that creates a virtual party experience. Currently featuring YouTube integration for synchronized music and video sharing in real-time.",
    thumbnail: partyroom,
    links: "https://github.com/Isyedsrk/Party-Room",
    liveLink: "https://partyroom.netlify.app/"
  },
  {
    id: 3,
    title: "Learning with AR",
    description:
      "Learning with AR enhances education by providing immersive, interactive experiences that make complex concepts easier to understand.",
    thumbnail: AR, 
    links: ""
  },
  {
    id: 4,
    title: "Obliviate",
    description: "Obliviate is a fast-paced 3D game where players control a ball moving forward, dodging obstacles in a run",
    thumbnail: obliviate,
    links:"https://github.com/Isyedsrk/OBLIVIATE"
  },
  {
    id: 5,
    title: "Fruit-Slicer",
    description: "Fruit-Slicer is an exciting 2D game where players slice flying fruits with swift swipes, aiming for high scores in a fast-paced challenge.",
    thumbnail: fs,
    links:"https://github.com/Isyedsrk/Fruit-Slicer"
  },
  {
    id: 6,
    title: "Apna super bazaar",
    description: "Apna Super Bazaar is an e-commerce website offering a wide range of products, providing a convenient and seamless online shopping experience.",
    thumbnail: asb,
    links:"https://github.com/Isyedsrk/E-Commerce-website"
  },
  {
    id: 7,
    title: "Healthease",
    description: "Healthease is an Android app that simplifies booking lab tests and medical appointments, offering easy access to healthcare services.",
    thumbnail: iconhe,
    links:"https://github.com/Isyedsrk/Healthcare"
  },
  {
    id: 8,
    title: "DAR",
    description: "DAR is a detection and recognition system app that accurately identifies and detects text, objects, and faces in real-time.",
    thumbnail: dar,
    links: "https://github.com/Isyedsrk/DAR-Detect-Recognize-"
  },
];

const Project = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handleViewClick = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };
  
  const handleGlimpseClick = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project && project.liveLink) {
      window.open(project.liveLink, "_blank", "noopener,noreferrer");
    } else {
      navigate(`/project-video/${projectId}`);
    }
  };

  const nextProject = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === projects.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevProject = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? projects.length - 1 : prevIndex - 1
    );
  };

  // Touch/swipe functionality
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextProject();
    } else if (isRightSwipe) {
      prevProject();
    }
  };

  const handleCardClick = (project, position) => {
    // Only allow clicks on center card
    if (position !== 0) {
      return;
    }
    // Handle the click for center card
    // You can add your click logic here if needed
  };

  const getVisibleProjects = () => {
    const visible = [];
    // Show 5 cards: 2 before, current, 2 after
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + projects.length) % projects.length;
      visible.push({ ...projects[index], position: i });
    }
    return visible;
  };

  const visibleProjects = getVisibleProjects();
  
  return (
    <>
      <ProjectAiAssistantModal />
      <main>
        <section className="py-5 text-center container">
          <div className="row py-lg-5">
            <div className="col-lg-6 col-md-8 mx-auto my-4">
              <h1 className="fw-light text-primary">Projects</h1>
              <p className="lead text-muted">
                Discover a selection of standout projects, showcasing a range of
                innovative work from web development and AR experiences to game
                creation. Each entry reflects my expertise and passion for
                technology.
              </p>
              <p className="d-flex justify-content-center gap-3 flex-wrap mb-0">
                <a
                  href="https://github.com/Isyedsrk"
                  className="btn btn-github"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <FaGithub style={{ color: "#00d4ff" }} />
                </a>
                <a
                  href="https://www.linkedin.com/in/syed-bakhtawar-abbas-2a17441a6/"
                  className="btn btn-linkedin"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin style={{ color: "#0a66c2" }} />
                </a>
              </p>
            </div>
          </div>
        </section>

        <div className="py-5 projects-carousel-section">
          <div className="carousel-container">
              <div className="carousel-wrapper">
                <button 
                  className="carousel-btn carousel-btn-left"
                  onClick={prevProject}
                  aria-label="Previous project"
                >
                  <FaChevronLeft />
                </button>
                
                <div 
                  className="carousel-track"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {visibleProjects.map((project) => (
                    <div
                      key={`${project.id}-${project.position}`}
                      className={`carousel-card ${
                        project.position === -2 ? 'far-left' :
                        project.position === -1 ? 'left' : 
                        project.position === 0 ? 'center' :
                        project.position === 1 ? 'right' :
                        'far-right'
                      }`}
                      onClick={() => handleCardClick(project, project.position)}
                    >
                      <div className="card shadow-lg">
                        <div className="card-img-container">
                          <img
                            className="card-img-top"
                            src={project.thumbnail}
                            alt={project.title}
                          />
                        </div>
                        <div className="card-body">
                          <h5 className="card-title">{project.title}</h5>
                          <p className="card-text">{project.description}</p>
                          <div className="d-flex justify-content-center gap-2">
                            {project.id !== 1 && project.id !== 2 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (project.position === 0) {
                                    handleViewClick(project.links);
                                  }
                                }}
                                type="button"
                                className="btn btn-primary btn-sm"
                              >
                                View
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (project.position === 0) {
                                  handleGlimpseClick(project.id);
                                }
                              }}
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                            >
                              Glimpse
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="carousel-btn carousel-btn-right"
                  onClick={nextProject}
                  aria-label="Next project"
                >
                  <FaChevronRight />
                </button>
              </div>
              
              <div className="carousel-indicators">
                {projects.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            </div>
        </div>
      </main>

      <style>{`
        .carousel-container {
          position: relative;
          width: 100%;
          padding: 2rem 0;
          overflow: hidden;
        }

        .carousel-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 500px;
        }

        .carousel-track {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100%;
          height: 500px;
          gap: 2rem;
        }

        .carousel-card {
          position: absolute;
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
        }

        .carousel-card:not(.center) {
          pointer-events: none;
        }

        .carousel-card.center {
          pointer-events: auto;
        }

        .carousel-card.center {
          z-index: 5;
          transform: translateX(0) scale(1);
          filter: none;
          opacity: 1;
        }

        .carousel-card.left {
          z-index: 4;
          transform: translateX(-200px) scale(0.8);
          filter: blur(1px);
          opacity: 0.7;
        }

        .carousel-card.right {
          z-index: 4;
          transform: translateX(200px) scale(0.8);
          filter: blur(1px);
          opacity: 0.7;
        }

        .carousel-card.far-left {
          z-index: 3;
          transform: translateX(-400px) scale(0.6);
          filter: blur(2px);
          opacity: 0.5;
        }

        .carousel-card.far-right {
          z-index: 3;
          transform: translateX(400px) scale(0.6);
          filter: blur(2px);
          opacity: 0.5;
        }

        .carousel-card .card {
          width: 350px;
          height: 500px;
          border: 1px solid rgba(0, 212, 255, 0.28);
          border-radius: 15px;
          overflow: hidden;
          background: #141414;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55);
          position: relative;
          display: flex;
          flex-direction: column;
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .carousel-card .card-img-container {
          height: 200px;
          width: 100%;
          overflow: hidden;
          flex-shrink: 0;
          background: #0a0a0a;
        }


        .carousel-card .card-img-top {
          border-radius: 0;
          height: 100%;
          width: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .carousel-card .card-body {
          padding: 1.5rem;
          padding-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
          background: #141414;
          min-height: 0;
          border: none;
          box-shadow: none;
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .carousel-card .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #00d4ff !important;
          flex-shrink: 0;
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .carousel-card .card-text {
          font-size: 0.9rem;
          color: rgba(245, 245, 245, 0.75);
          line-height: 1.4;
          margin-bottom: 1rem;
          flex: 1;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .carousel-card .btn {
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: none;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .carousel-card .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .carousel-card .btn-primary {
          background: #00d4ff;
          color: #000;
        }

        .carousel-card .btn-primary:hover {
          background: #00b8e0;
          color: #000;
        }

        .carousel-card .btn-outline-primary {
          border: none !important;
          box-shadow: none !important;
          color: #00d4ff;
          background: transparent;
          text-decoration: none;
        }

        .carousel-card .btn-outline-primary:hover {
          background: rgba(0, 212, 255, 0.16);
          color: #57e5ff;
        }

        .carousel-card .btn-outline-primary:focus-visible {
          outline: 2px solid rgba(0, 212, 255, 0.6);
          outline-offset: 2px;
        }

        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(20, 20, 20, 0.95);
          border: 2px solid rgba(0, 212, 255, 0.58);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #00d4ff;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
        }

        /* Hide navigation buttons on mobile */
        @media (max-width: 768px) {
          .carousel-btn {
            display: none;
          }
        }

        .carousel-btn:hover {
          background: #00d4ff;
          color: #000;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 24px rgba(0, 212, 255, 0.35);
        }

        .carousel-btn:active {
          transform: translateY(-50%) scale(0.95);
        }

        .carousel-btn-left {
          left: 2rem;
        }

        .carousel-btn-right {
          right: 2rem;
        }

        .carousel-indicators {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0, 212, 255, 0.38);
          background: #2a2a2a;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: #00d4ff;
          transform: scale(1.2);
          border-color: #00d4ff;
        }

        .indicator:hover {
          background: #00d4ff;
          opacity: 0.85;
        }

        /* Card Hover Effects */
        .carousel-card.center:hover {
          transform: translateX(0) scale(0.8);
        }

        .carousel-card.left:hover {
          transform: translateX(-200px) scale(0.7);
        }

        .carousel-card.right:hover {
          transform: translateX(200px) scale(0.7);
        }

        .carousel-card.far-left:hover {
          transform: translateX(-400px) scale(0.6);
        }

        .carousel-card.far-right:hover {
          transform: translateX(400px) scale(0.6);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .carousel-card .card {
            width: 300px;
            height: 450px;
          }

          .carousel-card.left {
            transform: translateX(-150px) scale(0.8);
          }

          .carousel-card.right {
            transform: translateX(150px) scale(0.8);
          }

          .carousel-card.far-left {
            transform: translateX(-300px) scale(0.6);
          }

          .carousel-card.far-right {
            transform: translateX(300px) scale(0.6);
          }

          .carousel-btn {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }

          .carousel-btn-left {
            left: 1rem;
          }

          .carousel-btn-right {
            right: 1rem;
          }
        }

        @media (max-width: 480px) {
          .carousel-card .card {
            width: 280px;
            height: 420px;
          }

          .carousel-card.left {
            transform: translateX(-120px) scale(0.8);
          }

          .carousel-card.right {
            transform: translateX(120px) scale(0.8);
          }

          .carousel-card.far-left {
            transform: translateX(-240px) scale(0.6);
          }

          .carousel-card.far-right {
            transform: translateX(240px) scale(0.6);
          }
        }

      `}</style>
    </>
  );
};

export default Project;
