import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaPhone, FaEnvelope } from "react-icons/fa6";

const PHONE_DISPLAY = "+91-9304541141";
const EMAIL = "syedabs49@gmail.com";

const IndiaFlagSvg = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 3 2"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="India flag"
    width="34"
    height="23"
  >
    <rect fill="#FF9933" width="3" height="0.667" />
    <rect fill="#FFFFFF" y="0.667" width="3" height="0.666" />
    <rect fill="#138808" y="1.333" width="3" height="0.667" />
    <g transform="translate(1.5 1)" fill="none" stroke="#000080" strokeLinecap="round">
      <circle r="0.2" strokeWidth="0.04" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * Math.PI) / 12;
        const r1 = 0.045;
        const r2 = 0.175;
        return (
          <line
            key={i}
            x1={r1 * Math.sin(a)}
            y1={-r1 * Math.cos(a)}
            x2={r2 * Math.sin(a)}
            y2={-r2 * Math.cos(a)}
            strokeWidth="0.028"
          />
        );
      })}
    </g>
  </svg>
);

const Footer = () => {
  return (
    <div className="container-fluid contain">
      <footer
        id="site-footer"
        className="site-footer row py-5 mt-5 align-items-center gy-4"
      >
        <div className="col-12 col-lg-6">
          <p className="footer-invite mb-3 mb-lg-4">Feel free to reach out.</p>
          <div className="footer-contact d-flex flex-column gap-2">
            <div className="footer-contact-line d-inline-flex align-items-center gap-2">
              <FaPhone className="footer-contact-icon flex-shrink-0" aria-hidden />
              <span>{PHONE_DISPLAY}</span>
            </div>
            <div className="footer-contact-line d-inline-flex align-items-center gap-2">
              <FaEnvelope className="footer-contact-icon flex-shrink-0" aria-hidden />
              <span>{EMAIL}</span>
            </div>
          </div>
          <p className="footer-from-india mb-0 mt-3 d-inline-flex align-items-center gap-2 flex-wrap">
            <span>From India</span>
            <IndiaFlagSvg className="footer-india-flag-svg" />
          </p>
        </div>
        <div className="col-12 col-lg-6 d-flex justify-content-lg-end align-items-center gap-3 flex-wrap">
          <a
            href="https://github.com/Isyedsrk"
            className="btn btn-github"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <FaGithub style={{ color: "#fff" }} />
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
        </div>
      </footer>
    </div>
  );
};
export default Footer;
