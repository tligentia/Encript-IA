import { AesIcon, XorIcon, CaesarIcon, Base64Icon } from './components/icons';
import { Algorithm } from './services/cryptoService';

export const SECRET_PHRASES: string[] = [
  "Que la Fuerza te acompañe... siempre.",
  "Solo sé que no sé casi nada.",
  "El principio de la sabiduría es el temor a equivocarse.",
  "Pienso, y por eso existo.",
  "Un gran poder conlleva una gran responsabilidad.",
  "No todos los que vagan están perdidos del todo.",
  "Houston, hemos tenido un pequeño problema.",
  "El invierno se acerca lentamente.",
  "Para el infinito, y un poco más allá.",
  "La vida es como una caja de chocolates surtidos."
];

export const ALGORITHMS: Algorithm[] = [
  {
    id: 'AES',
    name: 'AES-256',
    icon: AesIcon,
    description: 'Cifrado de grado militar. El estándar de oro en seguridad.',
    tooltip: 'AES-256 (GCM). Estándar de encriptación simétrica usado por gobiernos y corporaciones. Extremadamente seguro y recomendado para todos los datos sensibles.',
  },
  {
    id: 'XOR',
    name: 'XOR',
    icon: XorIcon,
    description: 'Cifrado binario con operación XOR. Muy seguro y reversible.',
    tooltip: 'Cifrado bit a bit. Teóricamente irrompible si la clave es aleatoria y tan larga como el mensaje. Muy seguro para uso general.',
  },
  {
    id: 'CAESAR',
    name: 'César',
    icon: CaesarIcon,
    description: 'Cifrado clásico por desplazamiento de caracteres.',
    tooltip: 'Un cifrado histórico que desplaza letras. Fácil de romper por análisis de frecuencia. No usar para datos sensibles.',
  },
  {
    id: 'BASE64',
    name: 'Base64',
    icon: Base64Icon,
    description: 'Codificación estándar. La clave actúa como validador.',
    tooltip: 'No es un cifrado, sino una codificación para transmitir datos. Es públicamente reversible y no ofrece ninguna seguridad.',
  },
];