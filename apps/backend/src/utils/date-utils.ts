export function subtractMonths(date: Date, months: number): Date {
  const modified = new Date(date);
  modified.setMonth(modified.getMonth() - months);
  return modified;
}

export function subtractSeconds(date: Date, seconds: number): Date {
  const modified = new Date(date);
  modified.setHours(modified.getHours() - seconds);
  return modified;
}

export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
