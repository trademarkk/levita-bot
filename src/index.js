const express = require('express');
const config = require('./config');
const { handleUpdate } = require('./handlers');
const { setWebhook } = require('./maxApi');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.post('/webhook/max', async (req, res) => {
  const incomingSecret = req.get('X-Max-Bot-Api-Secret') || '';

  if (config.maxWebhookSecret && incomingSecret !== config.maxWebhookSecret) {
    res.status(403).json({ ok: false, error: 'Invalid secret' });
    return;
  }

  res.status(200).json({ ok: true });

  try {
    await handleUpdate(req.body);
  } catch (error) {
    console.error('Failed to handle update:', error);
  }
});

app.listen(config.port, async () => {
  console.log(`LEVTIA MAX bot is running on port ${config.port}`);

  if (!config.maxBotToken) {
    console.warn('MAX_BOT_TOKEN is not set. Webhook registration skipped.');
    return;
  }

  if (!config.maxWebhookUrl) {
    console.warn('MAX_WEBHOOK_URL is not set. Webhook registration skipped.');
    return;
  }

  try {
    const result = await setWebhook();
    console.log('Webhook registration result:', result);
  } catch (error) {
    console.error('Webhook registration failed:', error.message);
  }
});
