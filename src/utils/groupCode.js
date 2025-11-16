export const normalizeJoinCode = (code = '') => String(code).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

export const isValidJoinCode = (code = '') => {
  const normalized = normalizeJoinCode(code);
  if (normalized.length !== 8) return false;
  const letters = (normalized.match(/[A-Z]/g) || []).length;
  const digits = (normalized.match(/[0-9]/g) || []).length;
  return letters === 4 && digits === 4;
};

export const generateJoinCode = () => {
  const lettersPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digitsPool = '0123456789';
  let letters = '';
  let digits = '';
  for (let i = 0; i < 4; i++) {
    letters += lettersPool[Math.floor(Math.random() * lettersPool.length)];
    digits += digitsPool[Math.floor(Math.random() * digitsPool.length)];
  }
  return `${letters}${digits}`;
};