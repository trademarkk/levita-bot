const config = require('./config');

const API_BASE = 'https://platform-api.max.ru';

async function maxRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: config.maxBotToken,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MAX API ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function sendMessage({ chatId, text, buttons = null, format = 'markdown' }) {
  const body = {
    text,
    format,
    notify: true,
  };

  if (buttons) {
    body.attachments = [
      {
        type: 'inline_keyboard',
        payload: {
          buttons,
        },
      },
    ];
  }

  return maxRequest(`/messages?chat_id=${encodeURIComponent(chatId)}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function setWebhook() {
  if (!config.maxWebhookUrl) {
    throw new Error('MAX_WEBHOOK_URL is not set');
  }

  return maxRequest('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      url: config.maxWebhookUrl,
      update_types: ['bot_started', 'message_created', 'message_callback'],
      secret: config.maxWebhookSecret,
    }),
  });
}

module.exports = {
  sendMessage,
  setWebhook,
};
