export interface Alert {
  id: string;
  title: string;
  severity: string;
  timestamp: string;
}

export interface AlertPayload extends Omit<Alert, 'id' | 'timestamp'> {}

export interface QueueItem {
  id: string;
  data: AlertPayload;
}