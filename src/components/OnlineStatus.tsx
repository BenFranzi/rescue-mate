import { FC } from 'react';
import { css } from '@emotion/react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOnline } from '@/client/useOnline.ts';

const containerStyles = css`display: flex;
  align-items: center;
  gap: 4px`;

const iconStyles = css`height: 16px;
  width: 16px`;

const OnlineStatus: FC = () => {
  const isOnline = useOnline();

  if (!isOnline) {
    return (
      <div css={ [containerStyles, css`color: orange`] }>
        <WifiOff css={ iconStyles } />
        <span>Offline</span>
      </div>
    );
  }
  return (
    <div css={ [containerStyles, css`color: greenyellow`] }>
      <Wifi css={ iconStyles } />
      <span>Online</span>
    </div>
  );
};

export default OnlineStatus;