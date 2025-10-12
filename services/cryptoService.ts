// FIX: Import React type to fix "Cannot find namespace 'React'" error.
import type React from 'react';

// --- SHARED TYPES ---
export type AlgorithmId = 'AES' | 'XOR' | 'CAESAR' | 'BASE64';

export interface Algorithm {
  id: AlgorithmId;
  name: string;
  description: string;
  tooltip: string;
  icon: React.FC<{ className?: string }>;
}

export type ValidationStatus = 'idle' | 'valid' | 'invalid';

export interface ValidationResult {
  status: ValidationStatus;
  message: string | null;
}

export interface PasswordStrength {
  label: string;
  color: string;
  width: string;
  textColor: string;
}

// --- UTILS ---
const uint8ArrayToBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode.apply(null, Array.from(bytes)));
const base64ToUint8Array = (base64: string): Uint8Array => Uint8Array.from(atob(base64), c => c.charCodeAt(0));

// --- AES-256-GCM CIPHER ---
const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
};

// --- XOR CIPHER ---
const xorCipher = (textBytes: Uint8Array, key: string): Uint8Array => {
  const textEncoder = new TextEncoder();
  const keyBytes = textEncoder.encode(key);
  if (keyBytes.length === 0) throw new Error("La clave no puede estar vacía.");
  const resultBytes = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    resultBytes[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return resultBytes;
};

// --- CAESAR CIPHER ---
const caesarCipher = (text: string, key: string, decrypt = false): string => {
    let shift = Array.from(key).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 95; // Printable ASCII range
    if (decrypt) shift = -shift;
    
    return Array.from(text).map(char => {
        const code = char.charCodeAt(0);
        if (code >= 32 && code <= 126) { // Printable ASCII
            let newCode = code + shift;
            if (newCode > 126) newCode = 32 + (newCode - 127);
            if (newCode < 32) newCode = 127 - (31 - newCode);
            return String.fromCharCode(newCode);
        }
        return char;
    }).join('');
};

// --- BASE64 CIPHER ---
// Handles UTF-8 characters correctly
const base64Encode = (text: string) => btoa(unescape(encodeURIComponent(text)));
const base64Decode = (data: string) => decodeURIComponent(escape(atob(data)));


// --- MAIN EXPORTS ---
export const encrypt = async (text: string, key: string, algorithm: AlgorithmId): Promise<string> => {
  if (!key) throw new Error("Se requiere una frase secreta para encriptar.");
  
  switch (algorithm) {
    // FIX: Add block scope to prevent variable redeclaration errors.
    case 'AES': {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const derivedKey = await deriveKey(key, salt);
        const textEncoder = new TextEncoder();
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            derivedKey,
            textEncoder.encode(text)
        );
        const encryptedBytes = new Uint8Array(encryptedData);
        // Combine salt, iv, and ciphertext: salt(16) + iv(12) + data
        const resultBytes = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
        resultBytes.set(salt, 0);
        resultBytes.set(iv, salt.length);
        resultBytes.set(encryptedBytes, salt.length + iv.length);
        return uint8ArrayToBase64(resultBytes);
    }
    // FIX: Add block scope to prevent variable redeclaration errors.
    case 'XOR': {
      const textBytes = new TextEncoder().encode(text);
      const encryptedBytes = xorCipher(textBytes, key);
      return uint8ArrayToBase64(encryptedBytes);
    }
    case 'CAESAR':
      return caesarCipher(text, key);
    case 'BASE64':
      return base64Encode(text);
    default:
      throw new Error("Algoritmo de encriptación no válido.");
  }
};

export const decrypt = async (cipherText: string, key: string, algorithm: AlgorithmId): Promise<string> => {
  if (!key) throw new Error("Se requiere una frase secreta para desencriptar.");
  
  switch (algorithm) {
     case 'AES':
            try {
                const fullBytes = base64ToUint8Array(cipherText);
                if (fullBytes.length < 28) { // 16 salt + 12 iv
                    throw new Error("El texto cifrado es demasiado corto para ser válido.");
                }
                const salt = fullBytes.slice(0, 16);
                const iv = fullBytes.slice(16, 28);
                const encryptedBytes = fullBytes.slice(28);
                const derivedKey = await deriveKey(key, salt);
                const decryptedData = await crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv: iv },
                    derivedKey,
                    encryptedBytes
                );
                const textDecoder = new TextDecoder();
                return textDecoder.decode(decryptedData);
            } catch (error) {
                console.error("AES decryption failed:", error);
                throw new Error("La desencriptación falló. La frase secreta podría ser incorrecta o el contenido está corrupto.");
            }
    case 'XOR':
      try {
        const cipherBytes = base64ToUint8Array(cipherText);
        const decryptedBytes = xorCipher(cipherBytes, key);
        // UTF-8 decoding with error checking
        const textDecoder = new TextDecoder('utf-8', { fatal: true });
        return textDecoder.decode(decryptedBytes);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'InvalidCharacterError') {
             throw new Error("La desencriptación falló. El contenido no es un texto cifrado válido (formato Base64 incorrecto).");
        }
        throw new Error("La desencriptación falló. La frase secreta podría ser incorrecta.");
      }
    case 'CAESAR':
      return caesarCipher(cipherText, key, true);
    case 'BASE64':
      try {
        return base64Decode(cipherText);
      } catch (error) {
        throw new Error("La desencriptación falló. El contenido no está en formato Base64 válido.");
      }
    default:
      throw new Error("Algoritmo de desencriptación no válido.");
  }
};