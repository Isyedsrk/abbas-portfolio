import Skill from "./Skill";
import dp from "./img/dp.jpg";
import Education from "./Education";

/** From `frontend/public/` — updated CV */
const CV_URL = "/Syed_Bakhtawar_Abbas_Updated.pdf";
const CV_DOWNLOAD_NAME = "Syed_Bakhtawar_Abbas_CV.pdf";

const About = () => {

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
              <p className="about-section-eyebrow mb-2">About me</p>
              <h1 className="about-intro__name display-5 mb-3 text-warning">
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
                  className="btn btn-warning btn-lg px-4"
                >
                  Download CV
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Education />
      <Skill />
    </>
  );
};
export default About;
