const nodemailer = require('nodemailer');
const config = require('./config');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  return transporter;
}

async function sendLeadEmail(lead) {
  const mailer = getTransporter();

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

  await mailer.sendMail({
    from: config.fromEmail,
    to: config.leadsEmail,
    subject: 'Новая заявка из MAX',
    text: lines.join('\n'),
  });
}

module.exports = {
  sendLeadEmail,
};
