import React from 'react';

const VerticalSeparator = () => (
    <div className="hidden sm:block w-px h-5 bg-gray-300" aria-hidden="true"></div>
);

interface FooterProps {
    onManageCookies: () => void;
}

const Footer: React.FC<FooterProps> = ({ onManageCookies }) => {
    return (
        <footer className="w-full text-gray-600 text-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-y-3 sm:gap-x-4">
                <span className="font-bold text-red-600">Versión 2025.v10B</span>
                
                <VerticalSeparator />
                
                <button 
                  type="button" 
                  onClick={onManageCookies} 
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
    );
};

export default Footer;