import { useEffect, useState } from 'react';

export function useCountdown() {
  const [seconds, setSeconds] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!seconds) return undefined;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  return { seconds, setSeconds, sending, setSending };
}
