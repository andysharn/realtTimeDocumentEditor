import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastMessage = ({ message }) => {
  const notify = () => toast(message);

  return (
    <button onClick={notify}>Show Toast</button>
  );
};

export default ToastMessage;