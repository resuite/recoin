import type { JSX } from 'retend/jsx-runtime';
import { Cell, For, useObserver } from 'retend';
import { Cancel } from '@/components/icons/cancel';
import './toast.scss';

interface ToastDetails {
  message: JSX.Template;
  timeout?: number;
  onClose?: () => void;
}

const activeToasts = Cell.source<ToastDetails[]>([]);
const toastsProxy = activeToasts.get();
const totalToasts = Cell.derived(() => activeToasts.get().length);

export const Toast = (details: ToastDetails, index: Cell<number>) => {
  const observer = useObserver();
  const toastRef = Cell.source<HTMLDivElement | null>(null);
  let timeoutId = undefined as ReturnType<typeof setTimeout> | undefined;

  const close = async () => {
    const toastElement = toastRef.get();
    if (!toastElement) return;

    toastElement.classList.add('ToastLeaving');
    await Promise.allSettled(
      toastElement.getAnimations().map((a) => a.finished)
    );
    clearTimeout(timeoutId);
    toastsProxy.splice(toastsProxy.indexOf(details), 1);
    details.onClose?.();
  };

  observer.onConnected(toastRef, (toast) => {
    toast.showPopover?.();
    toast.addEventListener('toast-close', close);

    if (details.timeout) {
      timeoutId = setTimeout(close, details.timeout);
    }
  });

  return (
    <div
      ref={toastRef}
      popover="manual"
      class="Toast"
      style={{ '--ToastIndex': index, '--ToastGap': 'var(--SpacingHalf)' }}
    >
      {details.message}
      <button
        type="button"
        class="ToastClose"
        title="Close Toast"
        onClick={close}
      >
        <Cancel />
      </button>
    </div>
  );
};

export const ToastOutlet = () => {
  return (
    <div id="Toasts" style={{ '--TotalToasts': totalToasts }}>
      {For(activeToasts, Toast)}
    </div>
  );
};

/**
 * Displays a toast notification with the provided details.
 *
 * @param toastDetails - The configuration object for the toast.
 */
export async function showToast(toastDetails: ToastDetails): Promise<void> {
  toastsProxy.push(toastDetails);
}
