import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './DoneCelebration.module.css';
import celebrationImage from '../assets/done-celebration.jpg';

interface DoneCelebrationProps {
  itemId: string | null;
  onDone: () => void;
}

export function DoneCelebration({ itemId, onDone }: DoneCelebrationProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!itemId) {
      setRect(null);
      return;
    }

    // Purely decorative motion — respect the user's OS-level preference not
    // to see it rather than offering a reduced version of the animation.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      onDone();
      return;
    }

    const card = document.querySelector(`[data-rfd-draggable-id="${itemId}"]`);
    const cardRect = card?.getBoundingClientRect() ?? null;
    setRect(cardRect);

    // If the card can't be found, there's nothing to animate over — bail out
    // immediately rather than leaving the caller's celebration state stuck.
    if (!cardRect) onDone();
  }, [itemId, onDone]);

  if (!itemId || !rect) return null;

  return createPortal(
    <img
      src={celebrationImage}
      alt=""
      aria-hidden="true"
      data-testid="done-celebration"
      className={styles.celebration}
      style={{ top: `${rect.top + rect.height / 2}px`, left: `${rect.left + rect.width / 2}px` }}
      onAnimationEnd={onDone}
    />,
    document.body,
  );
}
