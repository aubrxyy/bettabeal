import { toast, ToastContainer, ToastOptions } from 'react-toastify';

const toastQueue: string[] = [];
const toastLimit = 2;

const showToast = (message: string, options?: ToastOptions) => {
  if (toastQueue.length >= toastLimit) {
    const oldestToastId = toastQueue.shift();
    if (oldestToastId) {
      toast.dismiss(oldestToastId);
    }
  }

  const toastId = toast(message, options);
  toastQueue.push(toastId.toString());
};

export { showToast, ToastContainer };