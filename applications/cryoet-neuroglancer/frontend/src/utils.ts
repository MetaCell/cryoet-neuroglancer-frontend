import pako from "pako";

// Helper functions for parsing and encoding state
export const parseState = (hashState: string) => {
  const decodedHash = decodeURIComponent(hashState.slice(2));
  return JSON.parse(decodedHash);
};

export const encodeState = (jsonObject: any) => {
  const jsonString = JSON.stringify(jsonObject);
  const encodedString = encodeURIComponent(jsonString);
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
  const gzipContext = pako.gzip(hash);
  const base64UrlFragment = btoa(String.fromCharCode.apply(null, gzipContext));
  const newHash = `#!${b64Tob64Url(base64UrlFragment)}`;
  return newHash;
}

export function decompressHash(hash: string): string {
  if (hashIsUncompressed(hash)) {
    return hash;
  }
  let adjustedHash = hash;
  if (adjustedHash.startsWith("#!")) {
    adjustedHash = adjustedHash.slice(2);
  }
  const base64Context = b64UrlTo64(adjustedHash);
  const gzipedContext = Uint8Array.from(atob(base64Context), (c) =>
    c.charCodeAt(0),
  );
  const serializedContext = pako.ungzip(gzipedContext);
  return new TextDecoder().decode(serializedContext);
}
