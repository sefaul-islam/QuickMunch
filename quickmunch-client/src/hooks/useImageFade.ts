import { useState, useCallback } from 'react';

/**
 * Provides a smooth opacity fade-in when a lazy-loaded image finishes loading.
 *
 * Usage:
 * ```tsx
 * const { imgClassName, onLoad } = useImageFade();
 * <img className={`object-cover ${imgClassName}`} onLoad={onLoad} ... />
 * ```
 */
export function useImageFade(durationClass = 'duration-300') {
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const imgClassName = isLoaded
    ? `opacity-100 transition-opacity ${durationClass}`
    : 'opacity-0';

  return { isLoaded, onLoad, imgClassName };
}
