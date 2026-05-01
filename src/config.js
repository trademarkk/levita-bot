const path = require('path');
require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT || 3000),
  maxBotToken: process.env.MAX_BOT_TOKEN || '',
  maxWebhookSecret: process.env.MAX_WEBHOOK_SECRET || '',
  maxWebhookUrl: process.env.MAX_WEBHOOK_URL || '',
  studioPhone: process.env.STUDIO_PHONE || '+79288803832',
  resendApiKey: process.env.RESEND_API_KEY || '',
  leadsEmail: process.env.LEADS_EMAIL || '',
  fromEmail: process.env.FROM_EMAIL || '',
  dataFile: path.join(__dirname, '..', 'data', 'leads.json'),
};
