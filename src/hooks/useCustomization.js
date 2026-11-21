// src/hooks/useCustomization.js — live company customization for screens.
// Returns the in-memory customization INSTANTLY (already loaded for the app), so switching tabs never waits on the
// network. Refreshes only when the cached data is stale. App-foreground refresh is handled ONCE at the app root.
import { useEffect, useState } from 'react';
import { getCustomization, subscribeCustomization, loadCustomization, isCustomizationFresh } from '../services/customizationService';

export default function useCustomization() {
  const [c, setC] = useState(getCustomization());
  useEffect(() => {
    const off = subscribeCustomization(setC);
    setC(getCustomization());
    if (!isCustomizationFresh()) loadCustomization();
    return off;
  }, []);
  return c;
}
