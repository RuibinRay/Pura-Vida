import { useEffect, useRef } from 'react';
import { useT } from '../i18n';
import { Icon } from './Icon';

/** A native <dialog> sheet: Escape closes, focus returns to the opener, body scroll locked. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useT();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && d.open) {
      d.close();
      document.body.style.overflow = '';
    }
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCancel = (e: Event) => { e.preventDefault(); onClose(); };
    const onClick = (e: MouseEvent) => { if (e.target === d) onClose(); };
    d.addEventListener('cancel', onCancel);
    d.addEventListener('click', onClick);
    return () => { d.removeEventListener('cancel', onCancel); d.removeEventListener('click', onClick); };
  }, [onClose]);
  return (
    <dialog ref={ref} className="sheet paper" aria-label={title}>
      <div className="sheet__inner">
        <header className="sheet__head">
          <h2 className="sheet__title">{title}</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose} aria-label={t('common.close')}><Icon name="close" /></button>
        </header>
        <div className="sheet__body">{open && children}</div>
      </div>
    </dialog>
  );
}
