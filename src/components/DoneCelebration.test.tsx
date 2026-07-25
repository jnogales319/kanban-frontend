import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DoneCelebration } from './DoneCelebration';
import { fireAnimationEnd } from '../test/fireAnimationEnd';

function renderTargetCard(id: string) {
  const card = document.createElement('div');
  card.setAttribute('data-rfd-draggable-id', id);
  document.body.appendChild(card);
  return card;
}

function stubPrefersReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches } as MediaQueryList),
  );
}

describe('DoneCelebration', () => {
  afterEach(() => {
    document.querySelectorAll('[data-rfd-draggable-id]').forEach((el) => el.remove());
    vi.unstubAllGlobals();
  });

  it('renders nothing when there is no item to celebrate', () => {
    render(<DoneCelebration itemId={null} onDone={vi.fn()} />);

    expect(screen.queryByTestId('done-celebration')).not.toBeInTheDocument();
  });

  it('renders the celebration image once the matching card is found', () => {
    renderTargetCard('item-1');

    render(<DoneCelebration itemId="item-1" onDone={vi.fn()} />);

    expect(screen.getByTestId('done-celebration')).toBeInTheDocument();
  });

  it('calls onDone when the drift-and-fade animation finishes', () => {
    renderTargetCard('item-2');
    const onDone = vi.fn();

    render(<DoneCelebration itemId="item-2" onDone={onDone} />);
    fireAnimationEnd(screen.getByTestId('done-celebration'));

    expect(onDone).toHaveBeenCalledOnce();
  });

  it('calls onDone immediately when the target card cannot be found', () => {
    const onDone = vi.fn();

    render(<DoneCelebration itemId="missing-item" onDone={onDone} />);

    expect(onDone).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('done-celebration')).not.toBeInTheDocument();
  });

  it('skips the animation and calls onDone immediately when prefers-reduced-motion is set', () => {
    renderTargetCard('item-3');
    stubPrefersReducedMotion(true);
    const onDone = vi.fn();

    render(<DoneCelebration itemId="item-3" onDone={onDone} />);

    expect(onDone).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('done-celebration')).not.toBeInTheDocument();
  });

  it('still animates when prefers-reduced-motion is not set', () => {
    renderTargetCard('item-4');
    stubPrefersReducedMotion(false);
    const onDone = vi.fn();

    render(<DoneCelebration itemId="item-4" onDone={onDone} />);

    expect(onDone).not.toHaveBeenCalled();
    expect(screen.getByTestId('done-celebration')).toBeInTheDocument();
  });
});
