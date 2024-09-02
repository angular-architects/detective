import { concat, connect, debounceTime, OperatorFunction, take } from 'rxjs';

export function debounceTimeSkipFirst<T>(
  dueTime: number
): OperatorFunction<T, T> {
  return connect((value) =>
    concat(value.pipe(take(1)), value.pipe(debounceTime(dueTime)))
  );
}
