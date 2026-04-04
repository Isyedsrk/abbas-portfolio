import { FaGraduationCap } from "react-icons/fa";  
import { FaSchool } from "react-icons/fa";         

const Education = () => {
  const educations = [
    {
      id: "1",
      title: "B.Tech",
      board: "Integral University",
      Year: "2024",
      CGPA: "CGPA-7.8"
    },
    {
      id: "2",
      title: "Diploma",
      board: "Amity University",
      Year: "2021",
      CGPA: "CGPA-7.4"
    },
    {
      id: "3",
      title: "High School",
      board: "CBSE",
      Year: "2016",
      CGPA: "CGPA-8.1"
    },
  ];

  // Function to render different icons with colors based on education title
  const getIcon = (title) => {
    if (title === "B.Tech") return <FaGraduationCap style={{ fontSize: "1.5em", color: "#4CAF50" }} />;  
    if (title === "Diploma") return <FaGraduationCap style={{ fontSize: "1.5em", color: "#FFC107" }} />;  
    if (title === "High School") return <FaSchool style={{ fontSize: "1.5em", color: "#2196F3" }} />;   
    return null;
  };

  return (
    <>
      <div className="container px-4 py-5" id="featured-3">
        <h2 className="pb-2 border-bottom text-center text-muted">Education</h2>
        <div className="row g-4 py-5 row-cols-1 row-cols-lg-3 align-items-center">
          {educations.map(education => (
            <div className="feature col" key={education.id}>
              <div className="feature-icon ">
                {getIcon(education.title)} {/* Render the appropriate icon with color */}
              </div>
              <h4>{education.title}</h4>
              <h6 className="text-muted">{education.board}</h6>
              <h6 className="text-muted">{education.CGPA}</h6>
              <p className="text-muted">{education.Year}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Education;
