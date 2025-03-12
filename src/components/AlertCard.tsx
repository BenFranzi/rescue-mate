import { FC } from 'react';
import { Card } from '@radix-ui/themes';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { css } from '@emotion/react';
import { Alert } from '@/shared/types.ts';
import { CRISIS_IMAGE_MAP } from '@/shared/config.ts';

interface Props {
  alert: Alert;
}

const cardStyles = css`
  display: flex;
  gap: 16px;
  
  &[data-severity="critical"] { background: red }
  &[data-severity="warning"] { background: orange }
`;

const pillStyles = css`
  border-radius: 9999px;
  padding: 2px 16px;
  font-size: 14px;
  font-weight: bold;
  background: black;
  &[data-severity="critical"] {
    background: red; 
  }
  &[data-severity="warning"] { 
    background: orange;
    color: black;
  }
`;

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const getIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return () => <AlertCircle css={ css`color: red` } />;
    case 'warning':
      return () => <AlertTriangle  css={ css`color: orange` } />;
    default:
      return () => <Info />;
  }
};

const AlertCard: FC<Props> = ({ alert }) => {
  const Icon = getIcon(alert.severity);

  return (
    <Card css={ cardStyles } data-severity={ alert.severity }>
      <div css={{ display: 'flex', alignItems: 'center' }}>
        <img alt="" css={{ width: '48px', padding: '8px', aspectRatio: '1' }} src={ CRISIS_IMAGE_MAP[alert.title] ?? '/icons/icon.png' } />
      </div>
      <div css={{ display: 'flex', flex: '1', flexDirection: 'column', gap: '4px' }}>
        <div css={{ display: 'flex', justifyContent: 'space-between' }}>
          <span css={ pillStyles }  data-severity={ alert.severity }>
            {alert.severity}
          </span>
          <Icon />
        </div>
        <h1 css={{ fontSize: '12px' }}>Issued: {formatTimestamp(alert.timestamp)}</h1>
        <p>{alert.title}</p>
      </div>
    </Card>
  );
};
export default AlertCard;
