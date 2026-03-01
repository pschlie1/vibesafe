import { encrypt, decrypt } from "@/lib/crypto-util";

export interface AuthHeader {
  name: string;
  value: string;
}

export function encryptAuthHeaders(headers: AuthHeader[]): string {
  return encrypt(JSON.stringify(headers));
}

export function decryptAuthHeaders(encrypted: string): AuthHeader[] {
  try {
    return JSON.parse(decrypt(encrypted));
  } catch {
    return [];
  }
}

export function maskAuthHeaders(headers: AuthHeader[]): Array<{ name: string; value: string }> {
  return headers.map((h) => ({ name: h.name, value: "••••••••" }));
}
