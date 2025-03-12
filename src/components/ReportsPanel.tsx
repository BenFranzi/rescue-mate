import { FC, FormEvent, useRef, useState } from 'react';
import { Button, Card, Select } from '@radix-ui/themes';
import { css } from '@emotion/react';
import { Send } from 'lucide-react';
import { useStore } from '@/client';
import useToast from '@/client/useToast.ts';
import { AlertPayload } from '@/shared/types.ts';


const ReportsPanel: FC = () => {
  const { addAlert, state } = useStore();
  const [form, setForm] = useState({ title: '', severity: '' });
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await addAlert(form);

    toast({ message: 'added alert to sync queue.' });
    setForm({ title: '', severity: '' });
  };

  return (
    <Card css={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1>Report an Incident</h1>
        <p>Submit information about a disaster or emergency</p>
      </div>
      <form
        css={{ display: 'flex', gap: '16px', flexDirection: 'column' }}
        onSubmit={ handleSubmit }>
        <div css={{ 'display': 'flex', 'gap': '16px', '& > *': { flex: '1' } }}>
          <Select.Root
            required
            name="type"
            size="3"
            value={ form.title }
            onValueChange={ (value) => setForm({ ...form, title: value }) }
          >
            <Select.Trigger placeholder="Select an incident type" />
            <Select.Content>
              <Select.Item value="Bushfire Alert">Bushfire Alert</Select.Item>
              <Select.Item value="Flood Warning">Flood Warning</Select.Item>
              <Select.Item value="Heatwave">Heatwave</Select.Item>
              <Select.Item value="Seagull Uprising">Seagull Uprising</Select.Item>
            </Select.Content>
          </Select.Root>
          <Select.Root
            required
            name="severity"
            size="3"
            value={ form.severity }
            onValueChange={ (value) => setForm({ ...form, severity: value }) }
          >
            <Select.Trigger placeholder="Select the severity" />
            <Select.Content>
              <Select.Item value="critical">Critical</Select.Item>
              <Select.Item value="warning">Warning</Select.Item>
              <Select.Item value="info">Info</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
        <Button disabled={ state.isAddingAlert || !form.title || !form.severity } size="2"><Send /> Submit Report</Button>
      </form>
    </Card>
  );
};

export default ReportsPanel;
