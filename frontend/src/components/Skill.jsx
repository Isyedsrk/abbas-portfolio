import { DiJqueryLogo } from "react-icons/di";
import { FaReact } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io5";
import { FaUnity } from "react-icons/fa6";
import { FaPython } from "react-icons/fa";
import { TiHtml5 } from "react-icons/ti";
import { IoLogoCss3 } from "react-icons/io";
import {
  SiThreedotjs,
  SiNodedotjs,
  SiMysql,
  SiDocker,
  SiTailwindcss,
} from "react-icons/si";
import React from "react";

const Skill = () => {
  const mySkills = [
    {
      id: "1",
      title: "Tailwind CSS",
      description:
        "A utility-first CSS framework for building modern, responsive UIs quickly without leaving your HTML/JSX.",
      icon: SiTailwindcss,
      color: "#06B6D4",
    },
    {
      id: "2",
      title: "React",
      description: "A JavaScript library for building user interfaces.",
      icon: FaReact,
      color: "#61DBFB",
    },
    {
      id: "3",
      title: "JavaScript",
      description: "A programming language used for web development.",
      icon: IoLogoJavascript,
      color: "#F7DF1E",
    },
    {
      id: "4",
      title: "CSS",
      description: "A style sheet language for designing web pages.",
      icon: IoLogoCss3,
      color: "#264DE4",
    },
    {
      id: "5",
      title: "HTML",
      description: "The standard markup language for creating web pages.",
      icon: TiHtml5,
      color: "#E34C26",
    },
    {
      id: "6",
      title: "Python",
      description:
        "A powerful, versatile programming language used in data analysis, machine learning, and web development.",
      icon: FaPython,
      color: "#3776AB",
    },
    {
      id: "7",
      title: "Unity3D",
      description:
        "A real-time development platform used for creating 3D games and AR/VR applications.",
      icon: FaUnity,
      color: "#000000",
    },
    {
      id: "8",
      title: "jQuery",
      description:
        "A fast, small, and feature-rich JavaScript library for simplifying HTML document traversal and manipulation.",
      icon: DiJqueryLogo,
      color: "#0769AD",
    },
    {
      id: "9",
      title: "Three.js",
      description:
        "A cross-browser JavaScript library used to create and display animated 3D computer graphics in a web browser.",
      icon: SiThreedotjs,
      color: "#000000",
    },
    {
      id: "10",
      title: "Node.js",
      description:
        "A JavaScript runtime built on Chrome's V8 JavaScript engine for building scalable server-side applications.",
      icon: SiNodedotjs,
      color: "#339933",
    },
    {
      id: "11",
      title: "MySQL",
      description:
        "An open-source relational database management system used for web applications and data storage.",
      icon: SiMysql,
      color: "#4479A1",
    },
    {
      id: "12",
      title: "Docker",
      description:
        "A platform for developing, shipping, and running applications in isolated containers for consistent deployment.",
      icon: SiDocker,
      color: "#2496ED",
    },
  ];

  return (
    <div className="container-fluid skills-section about-panel" id="icon-grid">
      <div className="container col-xxl-10 px-3 px-lg-4 py-5">
        <header className="about-section-header text-center mb-4 mb-lg-5">
          <p className="about-section-eyebrow mb-2">Toolbox</p>
          <h2 className="about-section-title mb-0">Skills</h2>
        </header>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-4">
          {mySkills.map((skill) => {
            const isDarkIcon = skill.color === "#000000";
            return (
              <div className="col" key={skill.id}>
                <article className="skill-card h-100">
                  <div
                    className={`skill-card__icon${isDarkIcon ? " skill-card__icon--dark" : ""}`}
                    style={isDarkIcon ? undefined : { color: skill.color }}
                  >
                    {React.createElement(skill.icon, { size: 28 })}
                  </div>
                  <h3 className="skill-card__title">{skill.title}</h3>
                  <p className="skill-card__desc">{skill.description}</p>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Skill;
