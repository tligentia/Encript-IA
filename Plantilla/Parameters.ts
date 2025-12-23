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

// --- LÓGICA DE CLAVES (OFUSCACIÓN BASE64) ---
export const getShortcutKey = (shortcut: string): string | null => {
  const code = shortcut.toLowerCase().trim();
  // Desarrollador (ok) - AIzaSyBlJnxvcAxQXGYeGJxc8qM94xwOykEM7_o
  if (code === 'ok') return atob("QUl6YVN5QmxKbnh2Y0F4UVhHWWVHSlhjOHE0OTR4d095a0VNN19v");
  // Colaborador CV (cv) - AIzaSyAq1q6BE-sydl7V6ikMhQ9H0vMv491Mpy8
  if (code === 'cv') return atob("QUl6YVN5QXExcTZCRS1zeWRsN1Y2aWtNaFE5SDB2TXY0OTFNcHk4");
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