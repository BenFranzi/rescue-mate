import db from '@/shared/db.ts';

export const getToken = () => {
  return db.getConfigItem('token');
};

export const setToken = (token: string) => {
  return db.setConfigItem('token', token);
};

export const removeToken = () => {
  return db.removeConfigItem('token');
};


const baseHeaders = { 'Content-Type': 'application/json' };
export const getHeaders = async (): Promise<HeadersInit> => {
  const token = await getToken();
  return token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
};