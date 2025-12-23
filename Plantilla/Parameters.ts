import { GoogleGenAI } from "@google/genai";
import { LucideIcon } from 'lucide-react';

// --- TIPOS ---
export type CurrencyCode = 'USD' | 'EUR' | 'JPY' | 'BTC' | 'ETH';

export interface StageConfig {
  id: number;
  name: string;
  action: string;
  color: string;
  bg: string;
  icon: LucideIcon;
}

// --- CONSTANTES DE ESTILO ---
export const COLORS = {
  bg: 'bg-white',
  card: 'bg-white',
  textMain: 'text-gray-900',
  textSub: 'text-gray-500',
  accentRed: 'text-red-700',
  border: 'border-gray-200',
  btnPrimary: 'bg-gray-900 hover:bg-black text-white',
  btnAi: 'bg-gray-900 hover:bg-black text-white', 
  aiBg: 'bg-gray-50',
  aiText: 'text-gray-900',
  aiBorder: 'border-gray-200'
};

// --- CONFIGURACIÓN DE SEGURIDAD DINÁMICA ---
// IPs ofuscadas en Base64 para evitar lectura directa
const DEFAULT_IPS = [
  atob('NzkuMTEyLjg1LjE3Mw=='), // 79.112.85.173
  atob('MzcuMjIzLjE1LjYz')    // 37.223.15.63
];

export const getAllowedIps = (): string[] => {
  const stored = localStorage.getItem('app_allowed_ips');
  return stored ? JSON.parse(stored) : DEFAULT_IPS;
};

export const saveAllowedIps = (ips: string[]) => {
  localStorage.setItem('app_allowed_ips', JSON.stringify(ips));
};

// --- LÓGICA DE CLAVES (OFUSCACIÓN AVANZADA) ---
/**
 * Decodifica una cadena ofuscada mediante reversión y base64.
 * @param v Cadena ofuscada
 */
const _d = (v: string): string => {
  try {
    return atob(v.split('').reverse().join(''));
  } catch (e) {
    return "";
  }
};

export const getShortcutKey = (shortcut: string): string | null => {
  const code = shortcut.toLowerCase().trim();
  
  // Acceso Maestro (Nivel 1)
  if (code === 'ok') {
    return _d("v_7MENkyO0wx94q8HXJVeYWXQVxbcvxnJlBnYsaziI");
  }
  
  // Acceso Colaborador (Nivel 2)
  if (code === 'cv') {
    return _d("OHk5TTE5NHZNdkwwSDlRaE1raTY0VjdsZHlzLUVCNnExQXFTeVNhemlJ");
  }
  
  return null;
};

// --- SERVICIO GEMINI ---
export const generateContent = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error("API_MISSING");
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};