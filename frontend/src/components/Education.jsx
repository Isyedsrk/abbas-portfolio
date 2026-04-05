import { FaGraduationCap, FaSchool } from "react-icons/fa";

const Education = () => {
  const educations = [
    {
      id: "1",
      title: "B.Tech",
      board: "Integral University",
      Year: "2024",
      CGPA: "CGPA-7.8",
    },
    {
      id: "2",
      title: "Diploma",
      board: "Amity University",
      Year: "2021",
      CGPA: "CGPA-7.4",
    },
    {
      id: "3",
      title: "High School",
      board: "CBSE",
      Year: "2016",
      CGPA: "CGPA-8.1",
    },
  ];

  const getIcon = (title) => {
    if (title === "High School") {
      return <FaSchool className="education-card__svg" aria-hidden />;
    }
    return <FaGraduationCap className="education-card__svg" aria-hidden />;
  };

  return (
    <div className="container-fluid education-section about-panel" id="featured-3">
      <div className="container col-xxl-10 px-3 px-lg-4 py-5">
        <header className="about-section-header text-center mb-4 mb-lg-5">
          <p className="about-section-eyebrow mb-2">Academic path</p>
          <h2 className="about-section-title mb-0">Education</h2>
        </header>
        <div className="row g-4 justify-content-center">
          {educations.map((education) => (
            <div className="col-12 col-md-6 col-xl-4" key={education.id}>
              <article className="education-card h-100">
                <div className="education-card__icon-wrap" aria-hidden>
                  {getIcon(education.title)}
                </div>
                <h3 className="education-card__title">{education.title}</h3>
                <p className="education-card__school">{education.board}</p>
                <div className="education-card__meta">
                  <span className="education-card__pill">{education.CGPA}</span>
                  <span className="education-card__pill">{education.Year}</span>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Education;
