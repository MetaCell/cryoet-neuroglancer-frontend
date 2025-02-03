import pako from "pako";

function hash2jsonString(hash: string): string {
  if (hash.startsWith("#!")) {
    return hash.slice(2);
  }
  return hash;
}

// Helper functions for parsing and encoding state
export const parseState = (hashState: string) => {
  const hash = decompressHash(hash2jsonString(hashState));
  const decodedHash = decodeURIComponent(hash);
  return JSON.parse(hash2jsonString(decodedHash));
};

export const encodeState = (jsonObject: any) => {
  const jsonString = JSON.stringify(jsonObject);
  const encodedString = encodeURIComponent(jsonString);
  return compressHash(encodedString);
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
