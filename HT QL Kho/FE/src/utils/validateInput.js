/**
 * Validation utilities for Vinamilk ERP
 */

export const isValidPhone = (phone) => {
  if (!phone) return false;
  const clean = String(phone).replace(/[\s.-]/g, '');
  // Vietnam mobile: 10 digits starting with 03, 05, 07, 08, 09, or +84
  // Vietnam landline: starting with 02, 10-11 digits
  return /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(clean) ||
         /^(0|\+84)[35789][0-9]{8}$/.test(clean) ||
         /^(02)[0-9]{8,9}$/.test(clean);
};

export const isValidEmail = (email) => {
  if (!email) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email).trim());
};
