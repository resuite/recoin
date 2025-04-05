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
const totalToasts = Cell.derived(() => activeToasts.value.length);

export const Toast = (details: ToastDetails, index: Cell<number>) => {
  const observer = useObserver();
  const toastRef = Cell.source<HTMLDivElement | null>(null);
  let timeoutId = undefined as ReturnType<typeof setTimeout> | undefined;

  const close = async () => {
    if (!toastRef.value) return;

    toastRef.value.classList.add('ToastLeaving');
    await Promise.allSettled(
      toastRef.value.getAnimations().map((a) => a.finished)
    );
    clearTimeout(timeoutId);
    activeToasts.value.splice(activeToasts.value.indexOf(details), 1);
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
  activeToasts.value.push(toastDetails);
}
