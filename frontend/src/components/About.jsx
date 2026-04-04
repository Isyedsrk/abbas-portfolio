import Skill from "./Skill";
import dp from "./img/dp.jpg";
import Education from "./Education";
import SYED from './img/SYED.pdf';
const About = () => {

  return (
    <>
      <div className="container col-xxl-8 px-4 py-2">
        <div className="row flex-lg-row-reverse align-items-center g-5 py-2">
          <div className="col-10 col-sm-8 col-lg-6">
            <img
              src={dp}
              className="d-block mx-lg-auto img-fluid img-about"
              alt="Bootstrap Themes"
              width="500"
              height="400"
              loading="lazy"
            />
          </div>
          <div className="col-lg-6">
            <h4 className="display-5   mb-3 text-muted">
              Syed Bakhtawar Abbas
            </h4>
            <p className="lead">
             I am a passionate and enthusiastic Web App Developer with a strong foundation in full-stack development, GUI design, and Python programming. Skilled in React.js, Node.js, Express, Three.js, MySQL, and WebGL, I actively explore modern technologies to build efficient and interactive applications. As a software developer, I am seeking opportunities in frontend development, full-stack development, AR/VR integration, and data analysis. My diverse technical skill set and dedication to continuous learning enable me to contribute effectively to innovative projects and grow within a dynamic team environment.
            </p>
            <div className="d-grid gap-2 d-md-flex justify-content-md-start">
              <a type="button" href={SYED} download="SYED.pdf" className="btn btn-warning btn-lg px-4 me-md-2">
                Download CV
              </a>

            </div>
          </div>
        </div>
      </div>
      <Education />
      <Skill />
    </>
  );
};
export default About;
