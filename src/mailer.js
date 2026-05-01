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

async function sendLeadEmail(lead) {
  const resend = getResendClient();

  const lines = [
    'Новая заявка из MAX',
    '',
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Telegram: ${lead.telegram || 'не указан'}`,
    `MAX user id: ${lead.maxUserId}`,
    `MAX chat id: ${lead.chatId}`,
    `MAX username: ${lead.maxUsername || 'не указан'}`,
    `Время: ${lead.createdAt}`,
    'Источник: MAX bot / Яндекс Карты',
  ];

  try {
    const result = await resend.emails.send({
      from: config.fromEmail,
      to: config.leadsEmail,
      subject: 'Новая заявка из MAX',
      text: lines.join('\n'),
    });

    console.log('Lead email sent via Resend:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Lead email failed via Resend:', error);
    throw error;
  }
}

module.exports = {
  sendLeadEmail,
};
