import { generateJoinCode, isValidJoinCode, normalizeJoinCode } from '../utils/groupCode';

describe('groupCode utils', () => {
  test('generateJoinCode returns 8 chars', () => {
    const code = generateJoinCode();
    expect(code).toHaveLength(8);
  });

  test('generateJoinCode returns 4 letters and 4 digits', () => {
    const code = generateJoinCode();
    const letters = (code.match(/[A-Z]/g) || []).length;
    const digits = (code.match(/[0-9]/g) || []).length;
    expect(letters).toBe(4);
    expect(digits).toBe(4);
  });

  test('normalizeJoinCode removes non-alphanumerics and uppercases', () => {
    expect(normalizeJoinCode('ab12-cd34')).toBe('AB12CD34');
  });

  test('isValidJoinCode accepts 4 letters + 4 numbers', () => {
    expect(isValidJoinCode('ABCD1234')).toBe(true);
    expect(isValidJoinCode('AB12-CD34')).toBe(true);
    expect(isValidJoinCode('ABC12345')).toBe(false); // 3 letters, 5 digits
    expect(isValidJoinCode('ABCDE123')).toBe(false); // 5 letters, 3 digits
  });
});