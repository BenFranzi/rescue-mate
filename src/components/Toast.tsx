import { FC } from 'react';

interface Props {
  message: string;
}

const Toast: FC<Props> = ({ message }) => {
  return (<div>
    {message}
  </div>);
};

export default Toast;
