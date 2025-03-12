import { FC } from 'react';
import { Tabs } from 'radix-ui';
import { css } from '@emotion/react';
// import ReportsPanel from '@/components/ReportsPanel.tsx';
import OnlineStatus from '@/components/OnlineStatus.tsx';
import AlertsPanel from '@/components/AlertsPanel.tsx';
import AppBck from '@/App.bck.tsx';
import ReportsPanel from '@/components/ReportsPanel.tsx';


const tabsListStyles = css`
  display: flex;
  gap: 8px;
  background: #27272A;
  padding: 4px;
  border-radius: 8px;
`;

const tabTriggerStyles = css`
  cursor: pointer;
  display: block;
  flex: 1;
  white-space: nowrap;
  padding: 8px 0;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: transparent;
  border: none;
  transition: all 200ms;
  border-radius: 8px;
  
  &[data-state="active"] {
    background: #090909;
  }
  
  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }
`;

const App: FC = () => {
  return (
    <main>
      <div css={{ padding: '48px' }}>
        <section css={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div css={{ display: 'flex', justifyContent: 'space-between' }}>
            <div css={{ padding: '16px 0' }}>
              <h1 css={{ margin: '0' }}>Alert Mate</h1>
              <p>Stay informed about emergencies and report incidents</p>
            </div>
            <div css={{ paddingRight: '16px', alignItems: 'center', display: 'flex' }}>
              <OnlineStatus />
            </div>
          </div>
          <Tabs.Root defaultValue="alerts">
            <Tabs.List css={ tabsListStyles }>
              <Tabs.Trigger css={ tabTriggerStyles } value="alerts">
                Alerts
              </Tabs.Trigger>
              <Tabs.Trigger
                css={ tabTriggerStyles }
                value="report"
              >
                Report Incident
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content css={{ margin: '8px 0' }} value="alerts">
              <AlertsPanel />
            </Tabs.Content>
            <Tabs.Content css={{ margin: '8px 0' }} value="report">
              <ReportsPanel />
            </Tabs.Content>
          </Tabs.Root>
        </section>
      </div>
    </main>
  );
};

export default App;
