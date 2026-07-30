type ErrorToastListener = (message: string | null) => void;

const listeners = new Set<ErrorToastListener>();
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let currentMessage: string | null = null;

const emit = (message: string | null) => {
  currentMessage = message;
  listeners.forEach((listener) => listener(currentMessage));
};

export const showErrorToast = (message: string) => {
  const normalizedMessage = message.trim() || 'Something went wrong';
  emit(normalizedMessage);

  if (hideTimer) {
    clearTimeout(hideTimer);
  }

  hideTimer = setTimeout(() => {
    emit(null);
  }, 3000);
};

export const subscribeErrorToast = (listener: ErrorToastListener) => {
  listeners.add(listener);
  listener(currentMessage);

  return () => {
    listeners.delete(listener);
  };
};