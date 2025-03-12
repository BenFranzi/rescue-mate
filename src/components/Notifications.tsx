import { FC, useEffect, useState } from 'react';
import { Button, Switch } from '@radix-ui/themes';
import { FolderSync, ListRestart } from 'lucide-react';
import setupNotification, { checkNotificationStatus } from '@/client/setupNotification.ts';
import { useStore } from '@/client';

const Notifications: FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const { forceRefresh, requestBackgroundSync } = useStore();

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      const status = await checkNotificationStatus();
      setIsEnabled(status);
    } catch (error) {
      console.error('APP: failed to check notification status.', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      await setupNotification();
      await checkStatus();
    } catch (error) {
      console.error('APP: failed to setup notifications.', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div css={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Switch checked={ isEnabled } disabled={ isLoading } name="enableNotifications"
        onCheckedChange={ handleToggle }  />
      <label css={{ fontWeight: 'bold', fontSize: '14px' }} htmlFor="enableNotifications">Notifications</label>
      <Button aria-label="request background sync" onClick={ requestBackgroundSync }><FolderSync /></Button>
      <Button aria-label="force refresh" onClick={ forceRefresh }><ListRestart /></Button>
    </div>
  );
};
export default Notifications;

