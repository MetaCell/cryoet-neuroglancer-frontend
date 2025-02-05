import pako from "pako";
import {
  compressToEncodedURIComponent,
  compressToUint8Array,
  decompressFromEncodedURIComponent,
  decompressFromUint8Array,
} from "lz-string";

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

function gzipCompression(s: string): string {
  const gzipHash = pako.gzip(s);
  const base64UrlFragment = btoa(String.fromCharCode.apply(null, gzipHash));
  return b64Tob64Url(base64UrlFragment);
}

function gzipDecompression(s: string): string {
  const base64Hash = b64UrlTo64(s);
  const gzipedHash = Uint8Array.from(atob(base64Hash), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(pako.ungzip(gzipedHash));
}

// function lzstringCompression(s: string): string {
//   return compressToEncodedURIComponent(s);
// }

// function lzstringdecompression(s: string): string {
//   return decompressFromEncodedURIComponent(s);
// }

// function lzstringCompression2(s: string): string {
//   const uintArray = compressToUint8Array(s);
//   const base64UrlFragment = btoa(String.fromCharCode.apply(null, uintArray));
//   return b64Tob64Url(base64UrlFragment);
// }

// function lzstringDecompression2(s: string): string {
//   const base64Hash = b64UrlTo64(s);
//   const gzipedHash = Uint8Array.from(atob(base64Hash), (c) => c.charCodeAt(0));
//   return decompressFromUint8Array(gzipedHash);
// }

export function compressHash(hash: string): string {
  console.time("compression");
  if (hashIsCompressed(hash)) {
    return hash;
  }
  const compressedHash = gzipCompression(hash2jsonString(hash));
  console.timeEnd("compression");
  return `#!${compressedHash}`;
}

export function decompressHash(hash: string): string {
  if (hashIsUncompressed(hash)) {
    return hash;
  }
  console.time("decompression");
  const hashFragment = gzipDecompression(hash2jsonString(hash));
  console.timeEnd("decompression");
  return `#!${hashFragment}`;
}
