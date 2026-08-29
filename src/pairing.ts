import { validateImport } from './db';
import type { HouseholdState } from './types';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function encodePairing(state: HouseholdState): Promise<string> {
  const compressed = await transform(encoder.encode(JSON.stringify(state)), new CompressionStream('deflate'));
  return `v2.${toBase64Url(compressed)}`;
}

export async function decodePairing(value: string): Promise<HouseholdState> {
  if (value.startsWith('v2.')) {
    const decompressed = await transform(fromBase64Url(value.slice(3)), new DecompressionStream('deflate'));
    return validateImport(JSON.parse(decoder.decode(decompressed)));
  }
  return validateImport(JSON.parse(decoder.decode(fromBase64Url(value))));
}

async function transform(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const output = new Blob([copy.buffer]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(output).arrayBuffer());
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}
