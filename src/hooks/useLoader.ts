import { useGlobalLoader } from '@/context/LoaderContext';

/**
 * Hook para usar el loader global de manera más conveniente
 * 
 * @example
 * const { withLoader } = useLoader();
 * 
 * await withLoader('Guardando...', async () => {
 *   await saveData();
 * });
 */
export function useLoader() {
  const { showLoader, hideLoader } = useGlobalLoader();

  /**
   * Ejecuta una función asíncrona mostrando el loader
   * @param message Mensaje a mostrar en el loader
   * @param fn Función asíncrona a ejecutar
   */
  const withLoader = async <T>(message: string, fn: () => Promise<T>): Promise<T> => {
    showLoader(message);
    try {
      return await fn();
    } finally {
      hideLoader();
    }
  };

  return {
    showLoader,
    hideLoader,
    withLoader,
  };
}
