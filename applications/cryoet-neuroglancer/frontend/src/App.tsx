import { useEffect, useRef } from 'react';
import { encodeState, parseState } from './utils';
import { toggleLayersVisibility } from './services/layers';

const Main = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const neuroglancerUrl = import.meta.env.VITE_NEUROGLANCER_URL;

  // Add event listeners for hash changes and iframe messages
  useEffect(() => {
    const iframe = iframeRef.current;

    if (iframe) {
      const handleHashChange = () => {
        iframe.contentWindow?.postMessage(
          { type: 'hashchange', hash: window.location.hash },
          '*'
        );
      };

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== neuroglancerUrl) {
          return;
        }
        const { type, hash } = event.data;
        if (type === 'synchash' && window.location.hash !== hash) {
          history.replaceState(null, '', hash);
        }
      };

      window.addEventListener('hashchange', handleHashChange);
      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('hashchange', handleHashChange);
        window.removeEventListener('message', handleMessage);
      };
    }

    return () => { };
  }, [neuroglancerUrl]);



  // Button action for toggling layers visibility
  const toggleButton = () => {
    const currentHash = window.location.hash;
    const newState = toggleLayersVisibility(parseState(currentHash));
    const newHash = encodeState(newState);
    window.location.hash = newHash; // This triggers the hashchange listener
  };

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          height: '10vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f1f1f1',
          borderBottom: '1px solid #ccc',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        <h1 style={{ margin: 0 }}>Neuroglancer</h1>
        <p style={{ margin: '5px 0' }}>Neuroglancer is loaded in an iframe below</p>
        <button onClick={toggleButton}>Toggle layers visibility</button>
      </header>
      <div
        style={{
          height: '90vh',
          width: '100%',
          flexGrow: 1,
          overflow: 'hidden',
        }}
      >
        <iframe
          ref={iframeRef}
          src={`${neuroglancerUrl}/${window.location.hash}`}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          title="Neuroglancer"
        />
      </div>
    </div>
  );


};

export default Main;
