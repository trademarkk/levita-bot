function normalizePhone(input) {
  const trimmed = String(input || '').trim();
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('8')) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.length === 11 && digits.startsWith('7')) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+7${digits}`;
  }

  return null;
}

function normalizeTelegram(input) {
  const trimmed = String(input || '').trim();

  if (!trimmed) {
    return '';
  }

  const cleaned = trimmed.replace(/^@/, '').replace(/\s+/g, '');

  if (!/^[a-zA-Z0-9_]{5,32}$/.test(cleaned)) {
    return null;
  }

  return `@${cleaned}`;
}

function normalizeName(input) {
  const trimmed = String(input || '').trim().replace(/\s+/g, ' ');

  if (trimmed.length < 2 || trimmed.length > 40) {
    return null;
  }

  if (/\d/.test(trimmed)) {
    return null;
  }

  if (!/^[a-zA-Zа-яА-ЯёЁ\-\s]+$/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

module.exports = {
  normalizePhone,
  normalizeTelegram,
  normalizeName,
};
