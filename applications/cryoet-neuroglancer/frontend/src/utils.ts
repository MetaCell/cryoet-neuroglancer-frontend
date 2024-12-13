
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