import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router"
import { generate3DView } from "../../lib/ai.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import Button from "../../components/ui/Button";
import { createProject, getProjectById } from "../../lib/puter.actions";

const VisualizerId = () => {
  const { id } = useParams();
  // console.log("VisualizerId component rendered with id:", id);
  const navigate = useNavigate();
  const { userId } = useOutletContext<AuthContext>()
  // console.log("User ID from context:", userId);

  const hasInitialGenerated = useRef(false);

  const [project, setProject] = useState<DesignItem | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const handleBack = () => navigate('/');
  const handleExport = () => {
    if (!currentImage) return;

    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `roomify-${id || 'design'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const runGeneration = async (item: DesignItem) => {
    // console.log("Running generation for item:", item);
    if (!id || !item.sourceImage) return;

    try {
      setIsProcessing(true);
      const result = await generate3DView({ sourceImage: item.sourceImage });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);

        const updatedItem = {
          ...item,
          renderedImage: result.renderedImage,
          renderedPath: result.renderedPath,
          timestamp: Date.now(),
          ownerId: item.ownerId ?? userId ?? null,
          isPublic: item.isPublic ?? false,
        }

        console.log("Attempting to save project with updated item:", updatedItem);
        const saved = await createProject({ item: updatedItem, visibility: "private" })

        if (saved) {
          setProject(saved);
          setCurrentImage(saved.renderedImage || result.renderedImage);
        }
      }
    } catch (error) {
      console.error('Generation failed: ', error)
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    // console.log("Loading project with ID:", id);
    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);

      const fetchedProject = await getProjectById({ id });
      // console.log("Fetched project:", fetchedProject);

      if (!isMounted) return;

      setProject(fetchedProject);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setIsProjectLoading(false);
      hasInitialGenerated.current = false;
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    // console.log('Inside second useEffect - project or loading state changed:', { project, isProjectLoading });
    if (
      isProjectLoading ||
      hasInitialGenerated.current ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);

  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="log">
            <span className="name">Roomify</span>
          </Box>
        </div>
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <X className="icon" /> Exit Editor
        </Button>
      </nav>
      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{project?.name || `Residence ${id}`}</h2>
              <p className="note">Created by You</p>
            </div>

            <div className="panel-actions">
              <Button
                size="sm"
                onClick={() => { }}
                className="export"
                disabled={!currentImage || isProcessing}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button
                size="sm"
                onClick={() => { }}
                className="share"
              >
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>

          </div>

          <div className={`render-area ${isProcessing ? 'is-processing' : ''}`}>
            {currentImage ? (
              <img src={currentImage} alt="AI 3D Render" className="render-img" />
            ) : (
              <div className="render-placeholder">
                {project?.sourceImage && (
                  <img src={project?.sourceImage} alt="Original" className="render-fallback" />
                )}
              </div>
            )}
            {isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner" />
                  <span className="title">
                    Rendering...
                  </span>
                  <span className="subtitle">
                    Generating your 3D visualization
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default VisualizerId