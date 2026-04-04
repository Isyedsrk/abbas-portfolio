import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
const Footer = () => {
  return (
    <div className="container-fluid contain">
      <footer className="row  py-5 mt-5 border-top">
        

       

       
        <div className="col">
          <a
            href="https://github.com/Isyedsrk"
            className="btn btn-github"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub style={{ fontSize: "2.5em", color: "#fff" }} />
          </a>
          <a
            href="https://www.linkedin.com/in/syed-bakhtawar-abbas-2a17441a6/"
            className="btn btn-linkedin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin style={{ fontSize: "2.5em", color: "#0a66c2" }} />
          </a>
        </div>
      </footer>
    </div>
  );
};
export default Footer;
