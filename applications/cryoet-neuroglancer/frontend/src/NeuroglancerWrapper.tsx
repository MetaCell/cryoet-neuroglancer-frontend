import { useEffect, useRef } from "react";
import {
  compressHash,
  hashIsUncompressed,
  decompressHash,
} from "./utils";
import "./App.css";

interface NeuroglancerWrapperProps {
    baseUrl?: string
}

const NeuroglancerWrapper = ({ baseUrl: neuroglancerUrl = import.meta.env.VITE_NEUROGLANCER_URL }: NeuroglancerWrapperProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Add event listeners for hash changes and iframe messages
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return () => {};
    }
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hashIsUncompressed(hash)) {
        // In case we receive a uncompressed hash
        history.replaceState(null, "", compressHash(hash)); // We replace main window hash with the compressed one
        iframe.contentWindow?.postMessage(
          // We propagate the hash we received to the iframe
          { type: "hashchange", hash: hash },
          "*",
        );
        return;
      }
      // If the hash is compressed, we just decompress it
      iframe.contentWindow?.postMessage(
        { type: "hashchange", hash: decompressHash(hash) },
        "*",
      );
    };

    const handleMessage = (event: MessageEvent) => {
      const url = neuroglancerUrl.endsWith("/") ? neuroglancerUrl.slice(0, -1) : neuroglancerUrl
      if (event.origin !== url) {
        return;
      }
      const { type, hash } = event.data;
      // When we receive a sync from neuroglancer (iFrame), we know it's uncompressed
      if (type === "synchash" && window.location.hash !== hash) {
        const newHash = compressHash(hash);
        console.debug(
          "Hash gain, original",
          hash.length,
          "newHash",
          newHash.length,
          "gain",
          ((hash.length - newHash.length) / hash.length) * 100,
          "%",
        );
        history.replaceState(null, "", newHash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("message", handleMessage);
    };
  }, [neuroglancerUrl]);


  return (
    <iframe
      className="neuroglancer-iframe"
      ref={iframeRef}
      src={`${neuroglancerUrl}/${decompressHash(window.location.hash!)}`} // We need to give an uncompress hash initially
      title="Neuroglancer"
    />
  );
};

export default NeuroglancerWrapper;
