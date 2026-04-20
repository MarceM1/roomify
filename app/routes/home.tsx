import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import Navbar from "../../components/Navbar";
import type { Route } from "./+types/home";
import Button from "../../components/ui/Button";
import Upload from "../../components/Upload";
import { useNavigate } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Roomify" },
    { name: "description", content: "Powered by Roomify" },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  const handleUploadComplete = async (base64Image: string) => {
    const newId = Date.now().toString();
    navigate(`/visualizer/${newId}`);
    return true
  }

  return (
    <div className="home">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">

        {/* Hero */}
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <p>Introducing Roomify 2.0</p>
        </div>
        <h1>Build beatiful spaces at the speed of thought with Rommify</h1>
        <p className="subtitle">
          Rommify is an AI-first design environment that helps you visualize, render, and ship architectural projects faster than ever.
        </p>

        {/* CTA */}
        <div className="actions">
          <a href="#upload" className="cta">Start Building <ArrowRight className="icon" /></a>
          <Button variant="outline" size="lg" className="demo">
            Watch Demo
          </Button>
        </div>
        <div className="upload-shell" id="upload">
          <div className="grid-overlay" />
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>
              <h3>Upload your floor plan</h3>
              <p>Supports JPG, PNG, formats up to 50MB</p>
            </div>

            {/* Upload file */}
            <Upload onComplete={(base64) => {
              // console.log('Upload complete with base64:', base64)
              void handleUploadComplete(base64);
            }} />
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>Your latest work and shared community projects, all in one place.</p>
            </div>
          </div>
          <div className="projects-grid">
            <div className="project-card group">
              <div className="preview">
                <img src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png" alt="Project preview" />
                <div className="badge">
                  <span>Community</span>
                </div>
              </div>
              <div className="card-body">
                <div>
                  <h3>Project Manhattan</h3>
                  <div className="meta">
                    <Clock size={12} />
                    <span>{new Date('04.19.2027').toLocaleDateString()}</span>
                    <span>By Marcelo Melogno</span>
                  </div>
                </div>
                <div className="arrow">
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )

}
