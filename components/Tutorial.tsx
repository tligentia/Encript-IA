import React, { useState, useEffect } from 'react';
import { XIcon, ArrowLeftIcon, ArrowRightIcon, BookOpenIcon, AesIcon } from './icons';

interface TutorialProps {
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    icon: BookOpenIcon,
    title: "¡Bienvenido a Encript IA!",
    content: "Este rápido tutorial te guiará a través de los conceptos básicos para proteger tus textos. ¡Es muy fácil!",
  },
  {
    icon: AesIcon,
    title: "Paso 1: Elige tu Algoritmo",
    content: "Un algoritmo es el método de cifrado. Para la máxima seguridad, te recomendamos usar AES-256, el estándar de oro utilizado por gobiernos y corporaciones. Para este tutorial, lo dejaremos seleccionado.",
  },
  {
    title: "Paso 2: La Frase Secreta",
    content: "Esta es la parte más importante. Tu frase secreta es la única llave para encriptar y desencriptar tu contenido. ¡Asegúrate de que sea segura y que no la olvides!",
  },
  {
    title: "Paso 3: Añade tu Contenido",
    content: "Escribe o pega el texto que quieres proteger en el área de 'Contenido Original'.",
  },
  {
    title: "Paso 4: ¡A Encriptar!",
    content: "Una vez que tengas tu algoritmo, frase secreta y contenido listos, presiona el botón 'Encriptar'. Tu texto se transformará en un galimatías ilegible para cualquiera sin la clave.",
  },
  {
    title: "Paso 5: Tu Texto Seguro",
    content: "¡Listo! El resultado encriptado aparecerá a la derecha. Ahora puedes copiar este texto y enviarlo de forma segura. Nadie podrá leerlo sin la frase secreta correcta.",
  },
  {
    title: "Paso 6: El Proceso Inverso",
    content: "Para desencriptar, simplemente pega el texto cifrado en el área de 'Contenido', introduce la misma frase secreta que usaste originalmente y haz clic en 'Desencriptar'.",
  },
  {
    title: "Paso 7: ¡Estás listo!",
    content: "¡Felicidades! Ahora dominas el arte de la encriptación. Recuerda que puedes volver a ver este tutorial en cualquier momento haciendo clic en el icono del libro en la esquina superior derecha.",
  },
];

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && currentStep < TUTORIAL_STEPS.length - 1) handleNext();
      if (event.key === 'ArrowLeft' && currentStep > 0) handlePrev();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, onClose]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepData = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const progressPercentage = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      aria-labelledby="tutorial-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="p-6 space-y-4 text-center">
            {stepData.icon && <stepData.icon className="h-12 w-12 mx-auto text-red-600" />}
            <h2 id="tutorial-title" className="text-2xl font-bold text-gray-900">
                {stepData.title}
            </h2>
            <p className="text-gray-600 leading-relaxed">
                {stepData.content}
            </p>
        </div>

        <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
                  aria-label="Saltar tutorial"
                >
                  Saltar
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className="p-2 rounded-full text-gray-500 bg-white border border-gray-300 shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        aria-label="Paso anterior"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium text-gray-600" aria-live="polite">
                        {currentStep + 1} / {TUTORIAL_STEPS.length}
                    </span>
                    <button
                        onClick={handleNext}
                        disabled={isLastStep}
                        className="p-2 rounded-full text-gray-500 bg-white border border-gray-300 shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        aria-label="Siguiente paso"
                    >
                        <ArrowRightIcon className="h-4 w-4" />
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className={`text-sm font-semibold rounded-lg px-4 py-2 transition-all ${isLastStep ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-transparent text-gray-500 hover:text-gray-800'}`}
                >
                    {isLastStep ? 'Finalizar' : 'Siguiente'}
                </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-4">
                <div className="bg-red-600 h-1 rounded-full transition-all duration-300 ease-out" style={{ width: `${progressPercentage}%` }}></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
