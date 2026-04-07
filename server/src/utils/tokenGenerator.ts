import { prisma } from '../config/database.js';

/**
 * Generate the next daily token number.
 * Resets to 1 each day (global across the hospital).
 */
export async function getNextTokenNumber(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await prisma.appointment.aggregate({
    _max: { tokenNumber: true },
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  return (result._max.tokenNumber ?? 0) + 1;
}

/**
 * Generate the next MR Number.
 * Format: MR-YYYY-NNNNN (zero-padded 5-digit auto-increment).
 */
export async function getNextMRNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `MR-${year}-`;

  // Find the latest MR number for this year
  const latest = await prisma.patient.findFirst({
    where: { mrNumber: { startsWith: prefix } },
    orderBy: { mrNumber: 'desc' },
    select: { mrNumber: true },
  });

  let nextNum = 1;
  if (latest?.mrNumber) {
    const currentNum = parseInt(latest.mrNumber.replace(prefix, ''), 10);
    if (!isNaN(currentNum)) {
      nextNum = currentNum + 1;
    }
  }

  return `${prefix}${String(nextNum).padStart(5, '0')}`;
}
