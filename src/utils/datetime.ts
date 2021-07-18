export function addMilliseconds(date: Date, offset: number): Date {
  const clonedDate = new Date();
  clonedDate.setTime(date.getTime() + offset);

  return clonedDate;
}
