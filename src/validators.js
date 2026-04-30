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

  if (trimmed.startsWith('@')) {
    return trimmed;
  }

  return `@${trimmed}`;
}

module.exports = {
  normalizePhone,
  normalizeTelegram,
};
