import pako from "pako";

export interface SuperState extends Record<string, any> {
  neuroglancer: string;
}

export interface ResolvedSuperState extends Record<string, any> {
  neuroglancer: Record<string, any>;
}

const emptySuperState = (config: string): SuperState => {
  return {
    extra: 44,
    neuroglancer: config.length > 0 ? decompressHash(config) : "",
  };
};

export const updateState = (onStateChange: (state: ResolvedSuperState) => ResolvedSuperState) => {
  const state = currentState();
  const newState = onStateChange(state);
  commitState(newState);
};

export const newSuperState = (config: string): SuperState => {
  const state = parseSuperState(config);
  if (state.neuroglancer) {
    return state;
  }
  return emptySuperState(config);
};

export const updateNeuroglancerConfigInSuperstate = (
  superstate: SuperState,
  neuroglancerHash: string
): SuperState => {
  superstate.neuroglancer = neuroglancerHash;
  return superstate;
};

export const parseSuperState = (
  hash: string,
  previous?: SuperState
): SuperState => {
  if (!hash || hash.length === 0) {
    return emptySuperState("");
  }
  const superState = parseState(hash);
  if (!superState.neuroglancer) {
    if (previous) {
      previous.neuroglancer = decompressHash(hash);
      return previous;
    }
    return emptySuperState(hash);
  }
  return superState;
};

export const extractConfigFromSuperState = (hash: string): string => {
  const superstate = parseState(hash);
  return superstate.neuroglancer || "";
};

function hash2jsonString(hash: string): string {
  if (hash.startsWith("#!")) {
    return hash.slice(2);
  }
  return hash;
}

// Helper functions for parsing and encoding state
export const currentState = (hash = window.location.hash) => {
  const superState = parseState(hash);
  if (superState.neuroglancer) {
    superState.neuroglancer = parseState(superState.neuroglancer);
  }
  return superState;
};

export const commitState = (state: SuperState | ResolvedSuperState) => {
  state.neuroglancer = encodeState(state.neuroglancer, /* compress = */ false);
  const newHash = encodeState(state);
  window.location.hash = newHash; // This triggers the hashchange listener
};

export const parseState = (hashState: string) => {
  const hash = decompressHash(hash2jsonString(hashState));
  const decodedHash = decodeURIComponent(hash);
  return JSON.parse(hash2jsonString(decodedHash));
};

export const encodeState = (jsonObject: any, compress: boolean = true) => {
  const jsonString = JSON.stringify(jsonObject);
  const encodedString = encodeURIComponent(jsonString);
  if (compress) {
    return compressHash(encodedString);
  }
  return `#!${encodedString}`;
};

// Helper functions for parsing, compressing and decompressing hash
function b64Tob64Url(buffer: string): string {
  return buffer.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlTo64(value: string): string {
  const m = value.length % 4;
  return value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(value.length + (m === 0 ? 0 : 4 - m), "=");
}

export function hashIsUncompressed(hash: string): boolean {
  return hash.includes("%");
}

export function hashIsCompressed(hash: string): boolean {
  return !hashIsUncompressed(hash);
}

export function compressHash(hash: string): string {
  if (hashIsCompressed(hash)) {
    return hash;
  }
  const gzipHash = pako.gzip(hash2jsonString(hash));
  const base64UrlFragment = btoa(String.fromCharCode.apply(null, gzipHash));
  const newHash = `#!${b64Tob64Url(base64UrlFragment)}`;
  return newHash;
}

export function decompressHash(hash: string): string {
  if (hashIsUncompressed(hash)) {
    return hash;
  }
  const base64Hash = b64UrlTo64(hash2jsonString(hash));
  const gzipedHash = Uint8Array.from(atob(base64Hash), (c) => c.charCodeAt(0));
  const hashFragment = new TextDecoder().decode(pako.ungzip(gzipedHash));
  return `#!${hashFragment}`;
}
