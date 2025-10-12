import React, { useState, useEffect, useCallback } from 'react';

// --- Pin Entry Screen (internally used component) ---
interface PinEntryScreenProps {
  onSuccess: () => void;
}

const VALID_PINS = ['7887', 'star'];

const PinEntryScreen: React.FC<PinEntryScreenProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (error) return;

    const { key } = event;

    if (key === 'Backspace') {
      setPin((prev) => prev.slice(0, -1));
    } else if (/^[a-zA-Z0-9]$/.test(key) && pin.length < 4) {
      setPin((prev) => prev + key);
    }
  }, [pin.length, error]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (pin.length === 4) {
      if (VALID_PINS.includes(pin.toLowerCase())) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 800);
      }
    }
  }, [pin, onSuccess]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div 
        className={`bg-white p-8 rounded-2xl shadow-2xl text-center ${error ? 'animate-shake' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <h2 id="login-title" className="text-xl font-bold text-gray-800 mb-2">⭐ Acceso Requerido</h2>
        <p className="text-gray-500 mb-6">Introduce tu PIN de 4 caracteres.</p>
        <div className="flex justify-center gap-3 mb-4" aria-label={`PIN introducido: ${pin.length} de 4`}>
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className={`w-12 h-14 border-2 rounded-lg flex items-center justify-center text-3xl font-bold
                ${error ? 'border-red-500' : 'border-gray-300'}
                transition-colors`}
            >
              {pin[index] ? '*' : ''}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">Puedes empezar a teclear directamente.</p>
      </div>
    </div>
  );
};


// --- Login Guard (main export) ---
interface LoginGuardProps {
  isIpWhitelisted: boolean;
  children: React.ReactNode;
}

const LoginGuard: React.FC<LoginGuardProps> = ({ isIpWhitelisted, children }) => {
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);
  const isAuthenticated = isIpWhitelisted || isPinAuthenticated;

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return <PinEntryScreen onSuccess={() => setIsPinAuthenticated(true)} />;
};

export default LoginGuard;
