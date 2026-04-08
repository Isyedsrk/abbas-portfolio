import { useState } from "react";
import Skill from "./Skill";
import dp from "./img/dp.jpg";
import Education from "./Education";

/** From `frontend/public/` — updated CV */
const CV_URL = "/Syed_Bakhtawar_Abbas_Updated.pdf";
const CV_DOWNLOAD_NAME = "Syed_Bakhtawar_Abbas_CV.pdf";

const About = () => {
  const [activeTab, setActiveTab] = useState("education");
  /** Bumps on each Skills tab visit so Skill remounts and progress bars re-animate. */
  const [skillsMountKey, setSkillsMountKey] = useState(0);

  const handleSkillsTab = () => {
    setActiveTab("skills");
    setSkillsMountKey((k) => k + 1);
  };

  return (
    <>
      <section className="about-intro">
        <div className="container col-xxl-8 px-4 py-5">
          <div className="row flex-lg-row-reverse align-items-center g-5">
            <div className="col-10 col-sm-8 col-lg-6 mx-auto mx-lg-0">
              <div className="about-intro__photo">
                <img
                  src={dp}
                  className="d-block w-100 img-fluid img-about"
                  alt="Syed Bakhtawar Abbas"
                  width="500"
                  height="400"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="col-lg-6 text-center text-lg-start">
              <h1 className="about-intro__name display-5 mb-3 text-primary">
                Syed Bakhtawar Abbas
              </h1>
              <p className="lead about-intro__lead">
                I am a passionate and enthusiastic Web App Developer with a strong
                foundation in full-stack development, GUI design, and Python
                programming. Skilled in React.js, Node.js, Express, Three.js,
                MySQL, and WebGL, I actively explore modern technologies to build
                efficient and interactive applications. As a software developer, I
                am seeking opportunities in frontend development, full-stack
                development, AR/VR integration, and data analysis. My diverse
                technical skill set and dedication to continuous learning enable
                me to contribute effectively to innovative projects and grow
                within a dynamic team environment.
              </p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-start justify-content-center">
                <a
                  type="button"
                  href={CV_URL}
                  download={CV_DOWNLOAD_NAME}
                  className="btn btn-primary btn-lg px-4"
                >
                  Download CV
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        className="container-fluid education-section about-panel about-edu-skills"
        id="about-edu-skills"
        aria-label="Education and skills"
      >
        <div className="container col-xxl-10 px-3 px-lg-4 py-5">
          <div className="about-tabs-wrap text-center mb-4 mb-lg-5">
            <div
              className="about-tabs"
              role="tablist"
              aria-label="Education and skills"
            >
              <button
                type="button"
                role="tab"
                id="tab-education"
                aria-selected={activeTab === "education"}
                aria-controls="tab-panel-education"
                className={`about-tabs__btn${activeTab === "education" ? " about-tabs__btn--active" : ""}`}
                onClick={() => setActiveTab("education")}
              >
                Education
              </button>
              <button
                type="button"
                role="tab"
                id="tab-skills"
                aria-selected={activeTab === "skills"}
                aria-controls="tab-panel-skills"
                className={`about-tabs__btn${activeTab === "skills" ? " about-tabs__btn--active" : ""}`}
                onClick={handleSkillsTab}
              >
                Skills
              </button>
            </div>
            <p className="about-section-eyebrow mb-0 mt-3">
              {activeTab === "education" ? "Academic path" : "Toolbox"}
            </p>
          </div>
          <div
            id="tab-panel-education"
            role="tabpanel"
            aria-labelledby="tab-education"
            hidden={activeTab !== "education"}
          >
            <Education embedded />
          </div>
          <div
            id="tab-panel-skills"
            role="tabpanel"
            aria-labelledby="tab-skills"
            hidden={activeTab !== "skills"}
          >
            {activeTab === "skills" ? (
              <Skill embedded key={skillsMountKey} />
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
};
export default About;
