import { FC } from 'react';
import { Card, Skeleton } from '@radix-ui/themes';
import AlertCard from '@/components/AlertCard.tsx';
import Notifications from '@/components/Notifications.tsx';
import { useStore } from '@/client';

const AlertsPanel: FC = () => {
  const {  state  } = useStore();
  const alerts = state.alerts?.sort(({ timestamp: a }, { timestamp: b }) => Number(b) - Number(a)) || [];

  return (
    <div>
      <div css={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
        <h3 css={{ margin: 0 }}>Active Alerts</h3>
        <Notifications />
      </div>
      <div css={{ padding: '8px 0', gap: '8px', display: 'flex', flexDirection: 'column' }}>
        {
          state.isFetchingAlerts  && <Card>
            <Skeleton>Loading</Skeleton>
          </Card>
        }
        {
          alerts?.map((alert) => (
            <AlertCard key={ alert.id } alert={ alert } />
          ))
        }
      </div>
    </div>
  );
};

export default AlertsPanel;
