import { Signal, computed, effect, signal, untracked } from '@angular/core';

export function explicitEffect<T>(
  source: Signal<T>,
  action: (value: T) => void
) {
  effect(() => {
    const s = source();
    untracked(() => {
      action(s);
    });
  });
}

export function onceEffect(action: () => void) {
  const ref = effect(() => {
    untracked(() => {
      action();
      ref.destroy();
    });
  });
}

export function mirror<T>(source: Signal<T>) {
  const value = signal(source());
  return computed(() => {
    untracked(() => {
      value.set(source());
    });
    return {
      source: source(),
      value: value,
    };
  });
}
