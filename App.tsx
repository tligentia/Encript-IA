import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ALGORITHMS, SECRET_PHRASES } from './constants';
import { encrypt, decrypt, AlgorithmId, ValidationResult, PasswordStrength } from './services/cryptoService';
import { EyeIcon, EyeSlashedIcon, WandIcon, ClipboardIcon, CheckIcon, ArrowUpCircleIcon, XCircleIcon, CheckCircleIcon, XIcon, AesIcon } from './components/icons';
import { Shell } from './Plantilla/Shell';
import { Security } from './Plantilla/Seguridad';
import { getAllowedIps } from './Plantilla/Parameters';

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
    } catch (e) {}
};

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {}
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

const App: React.FC = () => {
  // --- TEMPLATE STATES ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useLocalStorage('gemini_api_key', '');
  const [userIp, setUserIp] = useState<string | null>(null);
  
  // --- APP STATES ---
  const [content, setContent] = useState<string>('');
  const [secretPhrase, setSecretPhrase] = useState<string>('');
  const [isSecretVisible, setIsSecretVisible] = useState<boolean>(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useLocalStorage<AlgorithmId>('encrypt-ia-selected-algorithm', 'AES');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOperation, setLastOperation] = useState<'encrypt' | 'decrypt' | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // --- INITIALIZATION (IP CHECK) ---
  useEffect(() => {
    const checkIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setUserIp(data.ip);
      } catch (e) {
        console.error("IP fetch error", e);
      }
    };
    checkIp();
  }, []);

  const isIpWhitelisted = useMemo(() => {
    if (!userIp) return false;
    return getAllowedIps().includes(userIp);
  }, [userIp]);

  // --- CRYPTO LOGIC ---
  const handleCrypto = async (op: 'encrypt' | 'decrypt') => {
    setError(null);
    if (!content || !secretPhrase) {
      setError('Se requiere contenido y una frase secreta.');
      return;
    }
    setIsLoading(true);
    try {
      const res = op === 'encrypt' 
        ? await encrypt(content, secretPhrase, selectedAlgorithm)
        : await decrypt(content, secretPhrase, selectedAlgorithm);
      setResult(res);
      setLastOperation(op);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error en la operación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      playCopySound();
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleGeneratePhrase = () => {
    const randomIndex = Math.floor(Math.random() * SECRET_PHRASES.length);
    setSecretPhrase(SECRET_PHRASES[randomIndex]);
  };

  // --- RENDER GUARDS ---
  if (!isAuthenticated && !isIpWhitelisted) {
    return <Security onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Shell apiKey={apiKey} onApiKeySave={setApiKey} userIp={userIp}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        
        {/* Toast Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-700 p-4 rounded-xl flex items-center justify-between shadow-sm mb-4">
            <div className="flex items-center gap-3">
              <XCircleIcon className="h-5 w-5 text-red-700" />
              <p className="text-sm font-bold text-red-900 uppercase tracking-tight">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-700 hover:bg-red-100 p-1 rounded-full">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Configuración */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">1. Algoritmo</h3>
              <div className="grid grid-cols-2 gap-2">
                {ALGORITHMS.map(algo => (
                  <button 
                    key={algo.id} 
                    onClick={() => setSelectedAlgorithm(algo.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                      selectedAlgorithm === algo.id 
                        ? 'bg-gray-900 border-gray-900 text-white shadow-lg' 
                        : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-900 hover:text-gray-900'
                    }`}
                  >
                    <algo.icon className="h-6 w-6 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{algo.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">2. Frase Secreta</h3>
              <div className="relative">
                <input
                  type={isSecretVisible ? 'text' : 'password'}
                  value={secretPhrase}
                  onChange={(e) => setSecretPhrase(e.target.value)}
                  placeholder="Tu llave privada..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pr-24 text-sm font-bold focus:ring-2 focus:ring-red-700 outline-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <button onClick={handleGeneratePhrase} className="p-2 text-gray-400 hover:text-red-700"><WandIcon className="h-5 w-5" /></button>
                  <button onClick={() => setIsSecretVisible(!isSecretVisible)} className="p-2 text-gray-400 hover:text-red-700">
                    {isSecretVisible ? <EyeSlashedIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">3. Texto Original</h3>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-700 outline-none resize-none"
                placeholder="Escribe aquí el mensaje..."
              />
            </div>
          </div>

          {/* Acciones y Resultado */}
          <div className="flex flex-col space-y-6">
            <div className="flex gap-4">
              <button 
                onClick={() => handleCrypto('encrypt')}
                disabled={isLoading}
                className="flex-1 bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-gray-200 disabled:opacity-50"
              >
                {isLoading ? '...' : 'Encriptar'}
              </button>
              <button 
                onClick={() => handleCrypto('decrypt')}
                disabled={isLoading}
                className="flex-1 bg-white border-2 border-gray-900 text-gray-900 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? '...' : 'Desencriptar'}
              </button>
            </div>

            <div className={`flex-1 rounded-3xl p-6 transition-all border ${result ? 'bg-white border-red-100 shadow-2xl' : 'bg-gray-50 border-dashed border-gray-200 flex flex-col items-center justify-center'}`}>
              {result ? (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700">
                      Resultado {lastOperation === 'encrypt' ? 'Cifrado' : 'Limpio'}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => { setContent(result); setResult(''); }} className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-red-700" title="Subir a contenido"><ArrowUpCircleIcon className="h-4 w-4"/></button>
                      <button onClick={handleCopy} className={`p-2 rounded-lg transition-colors ${isCopied ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400 hover:text-red-700'}`}>
                        {isCopied ? <CheckIcon className="h-4 w-4"/> : <ClipboardIcon className="h-4 w-4"/>}
                      </button>
                    </div>
                  </div>
                  <textarea 
                    readOnly 
                    value={result}
                    className="flex-1 w-full bg-transparent text-sm font-mono focus:outline-none resize-none"
                  />
                </div>
              ) : (
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center">Esperando ejecución...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default App;