'use client';

import { useLoader } from '@/hooks/useLoader';

/**
 * Componente de ejemplo que demuestra el uso del loader global
 * Este archivo es solo para referencia y puede ser eliminado
 */
export default function LoaderExample() {
  const { withLoader, showLoader, hideLoader } = useLoader();

  // Ejemplo 1: Usando withLoader (recomendado)
  const handleWithLoader = async () => {
    await withLoader('Procesando con withLoader...', async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
    });
  };

  // Ejemplo 2: Usando showLoader/hideLoader manualmente
  const handleManualLoader = async () => {
    showLoader('Procesando manualmente...');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      hideLoader();
    }
  };

  // Ejemplo 3: Con manejo de errores
  const handleWithError = async () => {
    try {
      await withLoader('Procesando con posible error...', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('Error simulado');
      });
    } catch (error) {
      console.error('Error capturado:', error);
      alert('Ocurrió un error');
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Ejemplos de Loader Global</h2>
      
      <div className="space-y-2">
        <button
          onClick={handleWithLoader}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ejemplo 1: Con withLoader
        </button>
        
        <button
          onClick={handleManualLoader}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Ejemplo 2: Manual
        </button>
        
        <button
          onClick={handleWithError}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Ejemplo 3: Con Error
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Código de ejemplo:</h3>
        <pre className="text-sm overflow-x-auto">
{`import { useLoader } from '@/hooks/useLoader';

function MyComponent() {
  const { withLoader } = useLoader();

  const handleAction = async () => {
    await withLoader('Procesando...', async () => {
      await someAsyncOperation();
    });
  };

  return <button onClick={handleAction}>Ejecutar</button>;
}`}
        </pre>
      </div>
    </div>
  );
}
