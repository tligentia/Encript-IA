import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ALGORITHMS, SECRET_PHRASES } from './constants';
import { encrypt, decrypt, AlgorithmId, ValidationResult, PasswordStrength } from './services/cryptoService';
import { EyeIcon, EyeSlashedIcon, WandIcon, TrashIcon, ClipboardIcon, CheckIcon, ArrowUpCircleIcon, XCircleIcon, CheckCircleIcon, XIcon, AesIcon } from './components/icons';
import Footer from './components/Footer';

// --- UTILS ---
const playCopySound = () => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (!audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.01);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.type = 'sine';
        oscillator.start(audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.error("No se pudo reproducir el sonido de copiado:", e);
    }
};

// --- CUSTOM HOOKS ---
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore = typeof storedValue === 'function' ? storedValue(storedValue) : storedValue;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

const useSecretPhraseValidation = (secretPhrase: string): { validation: ValidationResult, strength: PasswordStrength } => {
  const validation = useMemo<ValidationResult>(() => {
    if (!secretPhrase) return { status: 'idle', message: null };
    if (secretPhrase.length < 8) return { status: 'invalid', message: 'La frase debe tener al menos 8 caracteres.' };
    const hasLetter = /[a-zA-Z]/.test(secretPhrase);
    const hasNumber = /[0-9]/.test(secretPhrase);
    if (!hasLetter || !hasNumber) return { status: 'invalid', message: 'La frase debe incluir letras y números.' };
    return { status: 'valid', message: '¡Frase secreta válida!' };
  }, [secretPhrase]);

  const strength = useMemo<PasswordStrength>(() => {
    if (!secretPhrase) return { label: '', color: 'bg-gray-200', width: '0%', textColor: 'text-gray-500' };
    if (SECRET_PHRASES.includes(secretPhrase)) return { label: 'Muy Débil', color: 'bg-red-500', width: '15%', textColor: 'text-red-500' };
    if (secretPhrase.length < 8) return { label: 'Muy Débil', color: 'bg-red-500', width: '15%', textColor: 'text-red-500' };
    
    let score = 0;
    if (/[a-z]/.test(secretPhrase)) score++;
    if (/[A-Z]/.test(secretPhrase)) score++;
    if (/[0-9]/.test(secretPhrase)) score++;
    if (/[^a-zA-Z0-9]/.test(secretPhrase)) score++;
    if (secretPhrase.length >= 12) score++;

    const width = `${(score / 5) * 100}%`;
    switch (score) {
      case 1: return { label: 'Débil', color: 'bg-red-500', width, textColor: 'text-red-500' };
      case 2: return { label: 'Aceptable', color: 'bg-orange-500', width, textColor: 'text-orange-500' };
      case 3: case 4: return { label: 'Buena', color: 'bg-yellow-400', width, textColor: 'text-yellow-600' };
      case 5: return { label: 'Fuerte', color: 'bg-green-600', width, textColor: 'text-green-600' };
      default: return { label: 'Muy Débil', color: 'bg-red-500', width: '15%', textColor: 'text-red-500' };
    }
  }, [secretPhrase]);

  return { validation, strength };
};

const useCryptoOperations = () => {
    const [result, setResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastOperation, setLastOperation] = useState<'encrypt' | 'decrypt' | null>(null);

    const handleOperation = useCallback(async (
        operation: 'encrypt' | 'decrypt',
        content: string,
        secretPhrase: string,
        algorithm: AlgorithmId
    ) => {
        setError(null);
        if (!content || !secretPhrase) {
            setError('Se requiere contenido y una frase secreta.');
            return;
        }
        setIsLoading(true);
        try {
            const operationFn = operation === 'encrypt' ? encrypt : decrypt;
            const res = await operationFn(content, secretPhrase, algorithm);
            setResult(res);
            setLastOperation(operation);
        } catch (e) {
            setError(e instanceof Error ? e.message : `Ocurrió un error desconocido durante la ${operation === 'encrypt' ? 'encriptación' : 'desencriptación'}.`);
            setResult('');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearResult = () => {
        setResult('');
        setLastOperation(null);
    };

    return { result, isLoading, error, lastOperation, handleOperation, clearResult, setError };
};

const useClipboard = (text: string) => {
    const [isCopied, setIsCopied] = useState(false);

    const copy = useCallback(() => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            playCopySound();
            setIsCopied(true);
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }).catch(err => {
            console.error('Error al copiar el texto: ', err);
            // Consider setting an error state to show in the UI
        });
    }, [text]);

    return { isCopied, copy };
};

// --- Toast Component ---
interface ToastProps {
  message: string | null;
  onClose: () => void;
}
const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 5000);
            // When the component unmounts or message changes, clear the timer
            // and ensure the onClose is called if it hasn't been already.
            return () => {
                clearTimeout(timer);
                if (isVisible) { // If it was visible, call onClose to sync state
                    onClose();
                }
            };
        } else {
            setIsVisible(false);
        }
    }, [message, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        // Allow animation to finish before calling the parent's onClose
        setTimeout(onClose, 300); 
    };
    
    return (
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className={`fixed top-5 left-1/2 -translate-x-1/2 w-auto max-w-sm z-50 p-4 bg-red-600 text-white rounded-lg shadow-lg flex items-center space-x-3 transition-all duration-300 ease-in-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16 pointer-events-none'}`
          }
        >
          <XCircleIcon className="h-6 w-6 flex-shrink-0" />
          <span className="flex-grow text-sm font-medium">{message}</span>
          <button
            onClick={handleClose}
            aria-label="Cerrar"
            className="p-1 rounded-full hover:bg-red-700 transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      );
};


const App: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [secretPhrase, setSecretPhrase] = useState<string>('');
  const [isSecretVisible, setIsSecretVisible] = useState<boolean>(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useLocalStorage<AlgorithmId>('encrypt-ia-selected-algorithm', 'AES');
  const [resultKey, setResultKey] = useState(0);

  const { validation, strength: passwordStrength } = useSecretPhraseValidation(secretPhrase);
  const { result, isLoading, error, lastOperation, handleOperation, clearResult, setError } = useCryptoOperations();
  const { isCopied, copy: handleCopy } = useClipboard(result);
  
  const activeAlgorithm = useMemo(() => ALGORITHMS.find(a => a.id === selectedAlgorithm), [selectedAlgorithm]);

  const handleEncrypt = () => {
    handleOperation('encrypt', content, secretPhrase, selectedAlgorithm);
    setResultKey(key => key + 1);
  };
  const handleDecrypt = () => {
    handleOperation('decrypt', content, secretPhrase, selectedAlgorithm);
    setResultKey(key => key + 1);
  };
  
  const handleGeneratePhrase = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SECRET_PHRASES.length);
    setSecretPhrase(SECRET_PHRASES[randomIndex]);
  }, []);

  const handleClear = useCallback(() => {
    setContent('');
    setSecretPhrase('');
    clearResult();
    setError(null);
  }, [clearResult, setError]);

  const handleMoveResultToContent = useCallback(() => {
    if (!result) return;
    setContent(result);
    clearResult();
  }, [result, clearResult]);

  const inputBorderClasses = useMemo(() => {
    switch (validation.status) {
      case 'invalid': return 'border-red-500 focus:ring-red-500 focus:border-red-500';
      case 'valid': return 'border-green-500 focus:ring-green-500 focus:border-green-500';
      default: return 'border-gray-300 focus:ring-red-500 focus:border-red-500';
    }
  }, [validation.status]);

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen flex items-center justify-center p-3 sm:p-4">
      <Toast message={error} onClose={() => setError(null)} />
      <main className="bg-white border border-gray-200 p-4 rounded-xl shadow-xl w-full max-w-4xl space-y-4">
        <header className="flex justify-between items-start">
          <div className="flex items-center gap-2 sm:gap-3">
            <AesIcon className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 flex-shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Encript <span className="text-red-600">IA</span>
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Protege tu texto con cifrado de nivel militar.
              </p>
            </div>
          </div>
           <button onClick={handleClear} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-all duration-200" aria-label="Limpiar todo">
            <TrashIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
          {/* Columna Izquierda: Controles */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Algoritmo de Encriptación</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {ALGORITHMS.map(algo => (
                  <button key={algo.id} onClick={() => setSelectedAlgorithm(algo.id)} title={algo.tooltip} className={`p-2 border rounded-lg flex flex-col items-center justify-center text-center transition-all duration-200 ${selectedAlgorithm === algo.id ? 'bg-red-50 border-red-600 ring-1 ring-red-600' : 'bg-white border-gray-300 hover:border-red-500'}`} aria-pressed={selectedAlgorithm === algo.id}>
                    <algo.icon className={`h-5 w-5 mb-1 ${selectedAlgorithm === algo.id ? 'text-red-600' : 'text-gray-500'}`} />
                    <span className="text-xs font-semibold">{algo.name}</span>
                  </button>
                ))}
              </div>
              {activeAlgorithm && <p className="text-xs text-gray-500 mt-2">{activeAlgorithm.description}</p>}
            </div>

            <div>
              <label htmlFor="secret-phrase" className="block text-xs font-medium text-gray-700 mb-1.5">Frase Secreta</label>
              <div className="relative flex items-center">
                <input
                  id="secret-phrase"
                  type={isSecretVisible ? 'text' : 'password'}
                  value={secretPhrase}
                  onChange={(e) => setSecretPhrase(e.target.value)}
                  placeholder={activeAlgorithm?.id === 'REVERSE' ? 'Introduce una clave numérica...' : 'Introduce tu frase secreta...'}
                  className={`w-full text-sm bg-white border rounded-md h-8 pl-3 pr-24 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition ${inputBorderClasses}`}
                  aria-invalid={validation.status === 'invalid'}
                  aria-describedby="secret-phrase-validation"
                />
                <div className="absolute right-1.5 flex items-center space-x-1.5">
                  {validation.status === 'valid' && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                  {validation.status === 'invalid' && <XCircleIcon className="h-4 w-4 text-red-500" />}
                  <button onClick={handleGeneratePhrase} aria-label="Generar frase secreta" className="text-gray-400 hover:text-gray-800"><WandIcon className="h-4 w-4" /></button>
                  <button onClick={() => setIsSecretVisible(p => !p)} aria-label={isSecretVisible ? 'Ocultar' : 'Mostrar'} className="text-gray-400 hover:text-gray-800">{isSecretVisible ? <EyeSlashedIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}</button>
                </div>
              </div>
              {validation.message && <p id="secret-phrase-validation" className={`text-xs mt-1 ${validation.status === 'valid' ? 'text-green-600' : 'text-red-600'}`}>{validation.message}</p>}
              <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">Calidad de la clave:</span>
                      <span className={`text-xs font-bold ${passwordStrength.textColor}`}>{passwordStrength.label}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-1.5 w-full overflow-hidden">
                      <div className={`h-1.5 rounded-full ${passwordStrength.color} transition-all duration-300 ease-in-out`} style={{ width: passwordStrength.width }}></div>
                  </div>
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-xs font-medium text-gray-700 mb-1.5">Contenido Original / Cifrado</label>
              <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Escribe o pega el contenido aquí..." className="w-full text-sm bg-white border border-gray-300 rounded-md p-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"/>
            </div>
          </div>

          {/* Columna Derecha: Acciones y Resultado */}
          <div className="space-y-3 flex flex-col">
            <div className="flex items-center gap-3">
              <button onClick={handleEncrypt} disabled={isLoading} className="flex-1 text-sm h-8 px-4 py-2 bg-gray-900 text-white font-semibold rounded-md shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">{isLoading ? 'Encriptando...' : 'Encriptar'}</button>
              <button onClick={handleDecrypt} disabled={isLoading} className="flex-1 text-sm h-8 px-4 py-2 bg-gray-700 text-white font-semibold rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">{isLoading ? 'Desencriptando...' : 'Desencriptar'}</button>
            </div>
            
            <div key={resultKey} className={`pt-2 flex-grow flex flex-col ${result ? 'animate-fade-in' : 'justify-center items-center bg-gray-50 rounded-lg border-2 border-dashed'}`}>
              {result ? (
                <>
                  <label htmlFor="result" className="block text-xs font-medium text-gray-700 mb-1.5">Resultado ({lastOperation === 'encrypt' ? 'Encriptado' : 'Desencriptado'})</label>
                  <div className="relative h-full">
                    <textarea id="result" value={result} readOnly rows={5} className="w-full h-full text-sm bg-gray-50 border border-gray-300 rounded-md p-2 pr-16 text-gray-900 cursor-copy focus:outline-none focus:ring-1 focus:ring-red-500" onClick={(e) => (e.target as HTMLTextAreaElement).select()} />
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                        <button onClick={handleMoveResultToContent} title="Mover resultado a contenido" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full transition-all" aria-label="Mover resultado a contenido"><ArrowUpCircleIcon className="h-4 w-4" /></button>
                        <button onClick={handleCopy} title={isCopied ? "¡Copiado!" : "Copiar al portapapeles"} className={`p-1.5 rounded-full transition-all duration-200 ease-in-out ${isCopied ? 'bg-green-100' : 'hover:bg-gray-100'}`} aria-label="Copiar">
                            {isCopied ? <CheckIcon className="h-4 w-4 text-green-600" /> : <ClipboardIcon className="h-4 w-4 text-gray-500" />}
                        </button>
                    </div>
                  </div>
                </>
              ) : (<p className="text-gray-400 text-sm">El resultado aparecerá aquí</p>)}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default App;
