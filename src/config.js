const path = require('path');
require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT || 3000),
  maxBotToken: process.env.MAX_BOT_TOKEN || '',
  maxWebhookSecret: process.env.MAX_WEBHOOK_SECRET || '',
  maxWebhookUrl: process.env.MAX_WEBHOOK_URL || '',
  studioPhone: process.env.STUDIO_PHONE || '+79288803832',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  leadsEmail: process.env.LEADS_EMAIL || '',
  fromEmail: process.env.FROM_EMAIL || process.env.SMTP_USER || '',
  dataFile: path.join(__dirname, '..', 'data', 'leads.json'),
};
