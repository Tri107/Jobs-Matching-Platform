/**
 * Format salary in VND currency format
 * @param amount - salary amount in VND
 * @returns formatted string like "35,000,000"
 */
export function formatSalary(amount: number): string {
  return amount.toLocaleString('vi-VN');
}

/**
 * Format salary range
 * @param min - minimum salary
 * @param max - maximum salary
 * @returns formatted string like "35,000,000 - 55,000,000 VNĐ"
 */
export function formatSalaryRange(min: number, max: number): string {
  return `${formatSalary(min)} - ${formatSalary(max)} VNĐ`;
}

/**
 * Format salary in short format for compact display
 * @param amount - salary amount in VND
 * @returns formatted string like "35 triệu"
 */
export function formatSalaryShort(amount: number): string {
  const millions = amount / 1000000;
  if (millions >= 1) {
    return `${millions} triệu`;
  }
  return formatSalary(amount);
}
