export const validateName = (value: string): string | null => {
  const v = value.trim();
  if (!v) return 'নাম দিন';
  if (v.length < 2) return 'নাম কমপক্ষে ২ অক্ষরের হতে হবে';
  if (v.length > 100) return 'নাম ১০০ অক্ষরের বেশি হতে পারবে না';
  if (/\d/.test(v)) return 'নামে সংখ্যা ব্যবহার করা যাবে না';
  return null;
};

export const validateEmail = (value: string): string | null => {
  const v = value.trim();
  if (!v) return 'ইমেইল দিন';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'সঠিক ইমেইল দিন';
  if (v.length > 255) return 'ইমেইল খুব বড়';
  return null;
};

export const validatePhone = (value: string, required = true): string | null => {
  const v = value.trim();
  if (!v) return required ? 'ফোন নম্বর দিন' : null;
  if (!/^01[3-9]\d{8}$/.test(v)) return 'সঠিক ফোন নম্বর দিন (01XXXXXXXXX)';
  return null;
};

export const validatePassword = (value: string): string | null => {
  if (!value) return 'পাসওয়ার্ড দিন';
  if (value.length < 6) return 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
  return null;
};

export const validateRequired = (value: string, fieldName: string, minLen = 1): string | null => {
  const v = value.trim();
  if (!v) return `${fieldName} দিন`;
  if (v.length < minLen) return `${fieldName} কমপক্ষে ${minLen} অক্ষরের হতে হবে`;
  return null;
};
