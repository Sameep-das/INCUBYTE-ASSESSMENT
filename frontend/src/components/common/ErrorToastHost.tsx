import React, { useEffect, useState } from 'react';
import { ErrorCard } from './ErrorCard';
import { subscribeErrorToast } from '../../services/errorToast';

export const ErrorToastHost: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => subscribeErrorToast(setMessage), []);

  if (!message) {
    return null;
  }

  return <ErrorCard message={message} />;
};