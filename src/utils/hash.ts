/**
 * Computes the SHA-256 hash of an ArrayBuffer.
 * Uses the native Web Crypto API.
 * 
 * @param buffer The file data as an ArrayBuffer
 * @returns A hex string representation of the SHA-256 hash
 */
export async function computeSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Convert bytes to hex string
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
