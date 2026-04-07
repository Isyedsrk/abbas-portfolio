import { DiJqueryLogo } from "react-icons/di";
import { FaReact } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io5";
import { FaPython } from "react-icons/fa";
import { TiHtml5 } from "react-icons/ti";
import { IoLogoCss3 } from "react-icons/io";
import {
  FaLaptopCode,
  FaServer,
  FaDatabase,
  FaCode,
  FaCube,
  FaToolbox,
  FaUnity,
  FaRoute,
  FaGithub,
  FaCamera,
  FaMobileScreenButton,
} from "react-icons/fa6";
import {
  SiThreedotjs,
  SiNodedotjs,
  SiMysql,
  SiDocker,
  SiTailwindcss,
  SiExpress,
  SiFastapi,
  SiPostgresql,
  SiSqlite,
  SiSupabase,
  SiFirebase,
  SiPostman,
  SiVite,
  SiSocketdotio,
  SiJsonwebtokens,
} from "react-icons/si";
import React, { useState, useEffect } from "react";

const skillCategories = [
  {
    id: "frontend",
    title: "Frontend Development",
    categoryIcon: FaLaptopCode,
    blurb:
      "Responsive interfaces and component-driven UIs with modern web standards.",
    usp: false,
    items: [
      { name: "React", icon: FaReact, color: "#61DBFB", level: 60 },
      { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4", level: 70 },
      { name: "HTML", icon: TiHtml5, color: "#E34C26", level: 80 },
      { name: "CSS", icon: IoLogoCss3, color: "#264DE4", level: 85 },
      { name: "jQuery", icon: DiJqueryLogo, color: "#0769AD", level: 80 },
    ],
  },
  {
    id: "languages",
    title: "Programming Languages",
    categoryIcon: FaCode,
    blurb: "Languages I use across stacks, scripting, and tooling.",
    usp: false,
    items: [
      { name: "JavaScript", icon: IoLogoJavascript, color: "#F7DF1E", level: 55 },
      { name: "Python", icon: FaPython, color: "#3776AB", level: 50 },
    ],
  },
  {
    id: "backend",
    title: "Backend Development",
    categoryIcon: FaServer,
    blurb:
      "Server-side logic, APIs, auth, and scalable application architecture.",
    usp: false,
    items: [
      { name: "Node.js", icon: SiNodedotjs, color: "#339933", level: 65 },
      { name: "Express.js", icon: SiExpress, color: "#ffffff", level: 65 },
      { name: "FastAPI", icon: SiFastapi, color: "#009688", level: 40 },
      { name: "REST APIs", icon: FaRoute, color: "#ffc107", level: 50 },
      {
        name: "Authentication (JWT, bcrypt)",
        icon: SiJsonwebtokens,
        color: "#d63aff",
        level: 40,
      },
    ],
  },
  {
    id: "databases",
    title: "Databases",
    categoryIcon: FaDatabase,
    blurb: "From SQL to BaaS—modeling, queries, and cloud data backends.",
    usp: false,
    items: [
      { name: "Supabase", icon: SiSupabase, color: "#3FCF8E", level: 70 },
      { name: "Firebase", icon: SiFirebase, color: "#FFCA28", level: 65 },
      { name: "SQLite", icon: SiSqlite, color: "#003B57", level: 78 },
      { name: "MySQL", icon: SiMysql, color: "#4479A1", level: 80 },
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1", level: 50 },
    ],
  },
  {
    id: "ar3d",
    title: "AR / 3D Development",
    categoryIcon: FaCube,
    blurb:
      "Immersive experiences—engines, trackers, 3D on the web, and WebAR stacks.",
    usp: true,
    items: [
      { name: "Unity3D", icon: FaUnity, color: "#000000", level: 50 },
      { name: "Vuforia", icon: FaCamera, color: "#ffc107", level: 90 },
      { name: "Three.js", icon: SiThreedotjs, color: "#000000", level: 70 },
      {
        name: "WebAR (8th Wall, MindAR)",
        icon: FaMobileScreenButton,
        color: "#7c4dff",
        level: 60,
      },
    ],
  },
  {
    id: "tools",
    title: "Tools & Technologies",
    categoryIcon: FaToolbox,
    blurb: "Version control, API testing, build tooling, and realtime plumbing.",
    usp: false,
    items: [
      { name: "Git & GitHub", icon: FaGithub, color: "#ffffff", level: 55 },
      { name: "Postman", icon: SiPostman, color: "#FF6C37", level: 30 },
      { name: "Vite", icon: SiVite, color: "#646CFF", level: 80 },
      { name: "Socket.IO", icon: SiSocketdotio, color: "#010101", level: 65 },
      { name: "Docker", icon: SiDocker, color: "#2496ED", level: 50 },
    ],
  },
];

const BAR_ANIM_MS = 650;

function SkillTechRow({ item, barsRevealed }) {
  const level = Math.min(100, Math.max(0, item.level ?? 0));
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    if (!barsRevealed) {
      setDisplayPct(0);
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayPct(level);
      return;
    }

    let rafId;
    const start = performance.now();
    const easeOutCubic = (t) => 1 - (1 - t) ** 3;

    const step = (now) => {
      const t = Math.min(1, (now - start) / BAR_ANIM_MS);
      setDisplayPct(Math.round(level * easeOutCubic(t)));
      if (t < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [barsRevealed, level]);

  const isDarkIcon =
    item.color === "#000000" ||
    item.color === "#ffffff" ||
    item.color === "#010101" ||
    item.color === "#003B57";

  return (
    <li className="skill-category-card__tech-item">
      <div className="skill-category-card__tech-head">
        <span
          className={`skill-category-card__tech-icon${isDarkIcon ? " skill-category-card__tech-icon--dark" : ""}`}
          style={isDarkIcon ? undefined : { color: item.color }}
        >
          {React.createElement(item.icon, { size: 20 })}
        </span>
        <span className="skill-category-card__tech-name">{item.name}</span>
        <span className="skill-category-card__tech-pct">{displayPct}%</span>
      </div>
      <div
        className="skill-category-card__bar-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={displayPct}
        aria-label={`${item.name} proficiency: ${level} percent`}
      >
        <div
          className="skill-category-card__bar-fill"
          style={{
            width: barsRevealed ? `${level}%` : "0%",
          }}
        />
      </div>
    </li>
  );
}

const Skill = ({ embedded = false }) => {
  const [barsRevealed, setBarsRevealed] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) {
      setBarsRevealed(true);
      return;
    }
    let cancelled = false;
    setBarsRevealed(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setBarsRevealed(true);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const grid = (
    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 skill-category-grid">
      {skillCategories.map((cat) => {
        const CatIcon = cat.categoryIcon;
        return (
          <div className="col" key={cat.id}>
            <article
              className={`skill-category-card h-100${cat.usp ? " skill-category-card--usp" : ""}`}
            >
              <div className="skill-category-card__icon-wrap" aria-hidden>
                <CatIcon className="skill-category-card__cat-icon" />
              </div>
              <h3 className="skill-category-card__title">{cat.title}</h3>
              <p className="skill-category-card__blurb">{cat.blurb}</p>
              <ul className="skill-category-card__tech-list list-unstyled mb-0">
                {cat.items.map((item) => (
                  <SkillTechRow
                    key={`${cat.id}-${item.name}`}
                    item={item}
                    barsRevealed={barsRevealed}
                  />
                ))}
              </ul>
            </article>
          </div>
        );
      })}
    </div>
  );

  if (embedded) {
    return grid;
  }

  return (
    <div className="container-fluid skills-section about-panel" id="icon-grid">
      <div className="container col-xxl-10 px-3 px-lg-4 py-5">
        <header className="about-section-header text-center mb-4 mb-lg-5">
          <p className="about-section-eyebrow mb-2">Toolbox</p>
          <h2 className="about-section-title mb-0">Skills</h2>
        </header>
        {grid}
      </div>
    </div>
  );
};

export default Skill;
