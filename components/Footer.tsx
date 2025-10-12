import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';

// --- Privacy Modal Component (merged from PrivacyModal.tsx) ---
interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userIp: string | null;
  isIpWhitelisted: boolean;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, userIp, isIpWhitelisted }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in"
      aria-labelledby="privacy-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()} 
        role="document"
      >
        <div className="flex justify-between items-start mb-4">
            <h2 id="privacy-modal-title" className="text-xl font-bold text-gray-900">
                Cookies y Privacidad
            </h2>
            <button
                onClick={onClose}
                aria-label="Cerrar ventana modal"
                className="p-1 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
            >
                <XIcon className="h-5 w-5" />
            </button>
        </div>
        
        <div className="text-gray-700 text-sm space-y-4">
          <p>
            Este sitio utiliza cookies y tecnologías similares para mejorar la experiencia del usuario y analizar el tráfico.
          </p>

          <div>
            <h3 className="font-semibold text-gray-800">Cookies Esenciales</h3>
            <p>
              Necesarias para el funcionamiento básico del sitio. No se pueden desactivar.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800">Cookies de Rendimiento</h3>
            <p>
              Nos ayudan a entender cómo los visitantes interactúan con el sitio web, proporcionando información sobre las áreas visitadas, el tiempo de permanencia y cualquier problema encontrado.
            </p>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-md">
            <p className="font-semibold text-yellow-800">
              Esta aplicación no memoriza ninguna información, debe de asegurarse de guardar de forma segura sus claves.
            </p>
          </div>
          
          {userIp && (
            <div className="pt-2">
              <p className="text-gray-600">
                Tu dirección IP de origen es:{' '}
                <span className={`font-semibold ${isIpWhitelisted ? 'text-green-600' : 'text-gray-800'}`}>
                  {userIp}
                </span>
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 pt-2">
            Versión 2025.v10D
          </p>
          
          <p>
            No recopilamos información personal identificable sin su consentimiento explícito.
          </p>
        </div>
      </div>
    </div>
  );
};


// --- Main Footer Component ---
const VerticalSeparator = () => (
    <div className="hidden sm:block w-px h-5 bg-gray-300" aria-hidden="true"></div>
);

interface FooterProps {
    userIp: string | null;
    isIpWhitelisted: boolean;
}

const Footer: React.FC<FooterProps> = ({ userIp, isIpWhitelisted }) => {
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    return (
        <>
            <PrivacyModal 
                isOpen={isPrivacyModalOpen}
                onClose={() => setIsPrivacyModalOpen(false)}
                userIp={userIp}
                isIpWhitelisted={isIpWhitelisted}
            />
            <footer className="w-full text-gray-600 text-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-y-3 sm:gap-x-4">
                    <span className="font-bold text-red-600">Versión 2025.v10D</span>
                    
                    <VerticalSeparator />
                    
                    <button 
                      type="button" 
                      onClick={() => setIsPrivacyModalOpen(true)} 
                      className="text-gray-600 hover:text-red-800 hover:underline transition"
                    >
                        Cookies y Privacidad
                    </button>
                    
                    <VerticalSeparator />

                    <div>
                        <a href="https://jesus.depablos.es" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 hover:underline transition">Jesus de Pablos</a>
                        <span className="mx-1 text-gray-500">by</span>
                        <a href="https://www.tligent.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 hover:underline transition">Tligent</a>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
