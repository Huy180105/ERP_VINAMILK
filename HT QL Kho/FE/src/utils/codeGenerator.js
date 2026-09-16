/**
 * Helper utility to generate clean auto-incrementing codes for Vinamilk ERP forms.
 */

export function generateAutoCode(list = [], codeProp = 'id', prefix = 'CODE', digitCount = 3, includeDate = false) {
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fullPrefix = includeDate ? `${prefix}${todayStr}` : prefix;

  let maxNum = 0;
  const regex = new RegExp(`^${fullPrefix}(\\d+)$`, 'i');

  if (Array.isArray(list)) {
    list.forEach(item => {
      const code = (typeof item === 'object' && item !== null ? item[codeProp] : item) || '';
      const match = String(code).match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    // Fallback: If no match with date prefix, check any trailing digits with same base prefix
    if (maxNum === 0) {
      const baseRegex = new RegExp(`^${prefix}\\d*?(\\d{${digitCount},})$`, 'i');
      list.forEach(item => {
        const code = (typeof item === 'object' && item !== null ? item[codeProp] : item) || '';
        const match = String(code).match(baseRegex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      });
    }

    if (maxNum === 0) {
      list.forEach(item => {
        const code = (typeof item === 'object' && item !== null ? item[codeProp] : item) || '';
        const match = String(code).match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      });
    }
  }

  const nextNum = maxNum + 1;
  const paddedNum = String(nextNum).padStart(digitCount, '0');
  return `${fullPrefix}${paddedNum}`;
}
