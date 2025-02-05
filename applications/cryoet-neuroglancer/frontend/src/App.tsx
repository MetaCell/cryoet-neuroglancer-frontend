import "./App.css";
import NeuroglancerWrapper from "./NeuroglancerWrapper";
import { toggleLayersVisibility } from "./services/layers";
import { commitState, currentState } from "./utils";

const Main = () => {
  const cryoetUrl = import.meta.env.VITE_CRYOET_PORTAL_DOC_URL;
  const exampleHash = import.meta.env.VITE_EXAMPLE_CRYOET_HASH;

  // Button action for toggling layers visibility
  const toggleButton = () => {
    const state = currentState();
    const newState = toggleLayersVisibility(state);
    commitState(newState)
  };

  return (
    <div className="main-container">
      <header className="main-header">
        <a href={cryoetUrl} target="_blank" rel="noopener noreferrer">
          <button className="cryoet-doc-button">View documentation</button>
        </a>
        <p className="portal-title">CryoET data portal neuroglancer</p>
        <div className="button-group">
          <button
            className="toggle-button"
            onClick={() => {
              window.location.hash = exampleHash;
            }}
          >
              Load example data
          </button>
          <button className="toggle-button" onClick={toggleButton}>
              Toggle layers visibility
          </button>
        </div>
      </header>
      <div className="iframe-container">
        <NeuroglancerWrapper />
      </div>
    </div>
  );
};

export default Main;
