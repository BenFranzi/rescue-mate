import { useEffect, useState } from 'react';
import getIsOnline from '@/client/getIsOnline.ts';

export const useOnline = () => {
  const [isOnline, setIsOnline] = useState(getIsOnline());

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
    };
    const onOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', onOnline,false);
    window.addEventListener('offline', onOffline,false);

    return () => {
      window.removeEventListener('online', onOnline, false);
      window.removeEventListener('offline', onOffline,false);
    };
  }, [setIsOnline]);

  return isOnline;
};