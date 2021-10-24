export const convertPeriodToInterval = (interval: string) => {
  if (interval == 'Yearly') return 'Year';
  if (interval == 'Monthly') return 'Month';
  console.error('Unknown interval');
  return '';
};
