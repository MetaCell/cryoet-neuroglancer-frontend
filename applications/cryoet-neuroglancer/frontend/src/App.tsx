import { useCallback, useState } from "react";
import "./App.css";
import NeuroglancerWrapper from "./NeuroglancerWrapper";
import { toggleLayersVisibility } from "./services/layers";
import { commitState, currentState, ResolvedSuperState, updateState } from "./utils";




const Main = () => {
  const cryoetUrl = import.meta.env.VITE_CRYOET_PORTAL_DOC_URL;
  const exampleHash = import.meta.env.VITE_EXAMPLE_CRYOET_HASH;
  const [layers, setLayers] = useState<Array<any>>([])

  // Button action for toggling layers visibility
  const toggleButton = () => {
    updateState((state) => {
      return toggleLayersVisibility(state)
    })
  };

  const callback = useCallback((state: ResolvedSuperState) => {
    const neuroglancer = state.neuroglancer;
    setLayers([...neuroglancer.layers.filter(l => (l.visible === undefined || l.visible))])
  }, [setLayers])

  return (
    <div className="main-container">
      <header className="main-header">
        <a href={cryoetUrl} target="_blank" rel="noopener noreferrer">
          <button className="cryoet-doc-button">View documentation</button>
        </a>
        <p className="portal-title">CryoET data portal neuroglancer</p>
        {layers?.map(l => <p className="portal-title" key={l.name}>{l.name}</p>)}
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
        <NeuroglancerWrapper onStateChange={callback}/>
      </div>
    </div>
  );
};

export default Main;
