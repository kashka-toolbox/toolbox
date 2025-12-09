import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

/**
 * Hook for managing a URL query parameter.
 *
 * @template T - A string union type representing valid modes.
 * @param {T[]} modes - Array of valid mode values.
 * @param {T} defaultMode - The default mode to use if none is present in the URL.
 * @param {string} [param="mode"] - The query parameter name to use for the mode.
 * @returns {{
 *   mode: T,
 *   toggleMode: () => void,
 *   setMode: (newMode: T) => void,
 *   modes: T[]
 * }} An object containing the current mode, a function to toggle modes, a setter, and the list of modes.
 *
 * The hook syncs the mode with the URL, updates the URL when the mode changes,
 * and provides helpers to toggle or set the mode programmatically.
 */
const useURLMode = <T extends string>(modes: T[], defaultMode: T, param: string = "mode") => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const initialMode = searchParams.get(param) ?? defaultMode;
  const [mode, setMode] = useState<T>(modes.includes(initialMode as T) ? initialMode as T : defaultMode);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(param, mode);
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [mode, pathname, replace, searchParams, param]);

  const toggleMode = () => {
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  const setModeByValue = (newMode: T) => {
    if (modes.includes(newMode)) {
      setMode(newMode);
    } else {
      console.error(`Invalid mode: ${newMode}. Mode must be one of: ${modes.join(', ')}`);
    }
  };

  return { mode, toggleMode, setMode: setModeByValue, modes };
};

export default useURLMode;