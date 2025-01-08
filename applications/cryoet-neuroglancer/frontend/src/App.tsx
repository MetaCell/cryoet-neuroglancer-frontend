import { useEffect, useRef } from "react";
import { encodeState, parseState } from "./utils";
import { toggleLayersVisibility } from "./services/layers";
import "./App.css";

const Main = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const neuroglancerUrl = import.meta.env.VITE_NEUROGLANCER_URL;
  const cryoetUrl = import.meta.env.VITE_CRYOET_PORTAL_DOC_URL;
  const exampleHash = import.meta.env.VITE_EXAMPLE_CRYOET_HASH;

  // Add event listeners for hash changes and iframe messages
  useEffect(() => {
    const iframe = iframeRef.current;

    if (iframe) {
      const handleHashChange = () => {
        iframe.contentWindow?.postMessage(
          { type: "hashchange", hash: window.location.hash },
          "*",
        );
      };

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== neuroglancerUrl) {
          return;
        }
        const { type, hash } = event.data;
        if (type === "synchash" && window.location.hash !== hash) {
          history.replaceState(null, "", hash);
        }
      };

      window.addEventListener("hashchange", handleHashChange);
      window.addEventListener("message", handleMessage);

      return () => {
        window.removeEventListener("hashchange", handleHashChange);
        window.removeEventListener("message", handleMessage);
      };
    }

    return () => {};
  }, [neuroglancerUrl]);

  // Button action for toggling layers visibility
  const toggleButton = () => {
    const currentHash = window.location.hash;
    const newState = toggleLayersVisibility(parseState(currentHash));
    const newHash = encodeState(newState);
    window.location.hash = newHash; // This triggers the hashchange listener
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
        <iframe
          className="neuroglancer-iframe"
          ref={iframeRef}
          src={`${neuroglancerUrl}/${window.location.hash}`}
          title="Neuroglancer"
        />
      </div>
    </div>
  );
};

export default Main;
