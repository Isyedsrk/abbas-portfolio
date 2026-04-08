
import { useNavigate } from 'react-router-dom';
import bggg from "./img/bggg.png";

const Hero = () => {


  
  const navigate = useNavigate();
  const handleClick=()=>{
      navigate('./Project')
  }
  return (
    <div className="container back col-xxl-8 px-4 my-5">
      <div className="row flex-lg-row-reverse align-items-center g-5 py-2">
        <div className="col-10 col-sm-8 col-lg-6">
          <div className="card card-hero border-0 align-items-center">
            <img src={bggg} className="card-img img-side " alt="image" />
            <div className="card-img-overlay"></div>
          </div>
        </div>
        <div className="col-lg-6">
          <h1 className="display-5 fw-bold text-body-emphasis lh-1 mb-3 intro-word">
            I'm <span className="text-primary">Bakhtawar</span>
          </h1>
          <p className="lead">
            I am a full stack developer with a strong foundation in building interactive
            and responsive web applications using React and Three.js. I enjoy combining
            frontend and backend technologies to deliver engaging digital solutions. Open
            to freelancing opportunities for web-based projects. Feel free to connect!
          </p>
          <div className="d-grid gap-2 d-md-flex justify-content-md-start">
            <p>
            <button onClick={handleClick}
                            type="button"
                            className="btn btn-primary"
                          >
                            Projects
                          </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Hero;
