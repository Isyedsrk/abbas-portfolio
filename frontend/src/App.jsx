import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Project from "./components/Project";
import About from "./components/About";
import Contact from './components/Contact';
import VideoPlayer from './components/VideoPlayer';
import ChatButton from './components/ChatButton';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";


function App() {
  return (
    <div className="app-root d-flex flex-column min-vh-100">
      <Router>
        <Header />
        <ChatButton />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/Project" element={<Project />} />
            <Route path="/project-video/:id" element={<VideoPlayer />} />
            <Route path="/About" element={<About />} />
            <Route path="/Contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
