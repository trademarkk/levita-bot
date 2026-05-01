const { Resend } = require('resend');
const config = require('./config');

let resendClient = null;

function getResendClient() {
  if (!config.resendApiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }

  if (!resendClient) {
    resendClient = new Resend(config.resendApiKey);
  }

  return resendClient;
}

function buildTelegramLink(telegram) {
  if (!telegram) {
    return null;
  }

  return `https://t.me/${telegram.replace(/^@/, '')}`;
}

async function sendLeadEmail(lead) {
  const resend = getResendClient();
  const telegramLink = buildTelegramLink(lead.telegram);

  const textLines = [
    'Новая заявка из MAX',
    '',
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Telegram: ${lead.telegram || 'не указан'}`,
    `Время: ${lead.createdAt}`,
    `Источник: ${lead.source || 'не указан'}`,
  ];

  if (telegramLink) {
    textLines.push(`Ссылка на Telegram: ${telegramLink}`);
  }

  const html = [
    '<div style="font-family:Arial,sans-serif;line-height:1.5;color:#222">',
    '<h2 style="margin:0 0 16px;">Новая заявка из MAX</h2>',
    `<p><strong>Имя:</strong> ${lead.name}</p>`,
    `<p><strong>Телефон:</strong> <a href="tel:${lead.phone}">${lead.phone}</a></p>`,
    `<p><strong>Telegram:</strong> ${lead.telegram || 'не указан'}</p>`,
    telegramLink
      ? `<p><a href="${telegramLink}">Открыть Telegram</a></p>`
      : '',
    `<p><strong>Время:</strong> ${lead.createdAt}</p>`,
    `<p><strong>Источник:</strong> ${lead.source || 'не указан'}</p>`,
    '</div>',
  ].join('');

  const subject = lead.source
    ? `Новая заявка из MAX [${lead.source}]`
    : 'Новая заявка из MAX';

  try {
    const result = await resend.emails.send({
      from: config.fromEmail,
      to: config.leadsEmail,
      subject,
      text: textLines.join('\n'),
      html,
    });

    console.log('Lead email sent via Resend');
    return result;
  } catch (error) {
    console.error('Lead email failed via Resend:', error);
    throw error;
  }
}

module.exports = {
  sendLeadEmail,
};
