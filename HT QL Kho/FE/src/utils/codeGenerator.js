/**
 * Helper utility to generate clean auto-incrementing codes for Vinamilk ERP forms.
 */

export function generateAutoCode(list = [], codeProp = 'id', prefix = 'CODE', digitCount = 3, includeDate = false) {
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fullPrefix = includeDate ? `${prefix}${todayStr}` : prefix;

  let maxNum = 0;
  const regex = new RegExp(`^${fullPrefix}[-_]?(\\d+)`, 'i');

  if (Array.isArray(list) && list.length > 0) {
    list.forEach(item => {
      if (!item) return;

      // Try multiple ways to get the code string
      let code = '';
      if (typeof item === 'string') {
        code = item.trim();
      } else if (typeof item === 'object') {
        code = String(
          item[codeProp] || 
          item[codeProp.toLowerCase()] || 
          item[codeProp.toUpperCase()] || 
          item.id || 
          item.code || 
          Object.values(item).find(v => typeof v === 'string' && v.toUpperCase().includes(prefix.toUpperCase())) ||
          ''
        ).trim();
      }

      // Check regex match
      const match = code.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      } else {
        // Fallback: if code contains prefix and trailing digits
        const upperCode = code.toUpperCase();
        const upperPrefix = prefix.toUpperCase();
        if (upperCode.includes(upperPrefix)) {
          const digitsMatch = code.match(/(\d+)\s*$/);
          if (digitsMatch) {
            const num = parseInt(digitsMatch[1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        }
      }
    });
  }

  const nextNum = maxNum + 1;
  const paddedNum = String(nextNum).padStart(digitCount, '0');
  return `${fullPrefix}${paddedNum}`;
}
