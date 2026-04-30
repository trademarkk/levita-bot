const { getSession, resetSession } = require('./state');
const { saveLead } = require('./storage');
const { sendLeadEmail } = require('./mailer');
const { sendMessage } = require('./maxApi');
const { normalizePhone, normalizeTelegram } = require('./validators');
const {
  getStartText,
  getStartButtons,
  getTelegramButtons,
  getFinishText,
  getFinishButtons,
} = require('./messages');

async function sendWelcome(chatId) {
  await sendMessage({
    chatId,
    text: getStartText(),
    buttons: getStartButtons(),
  });
}

async function startLeadForm(chatId, userId) {
  const session = resetSession(userId);
  session.step = 'waiting_name';

  await sendMessage({
    chatId,
    text: 'Как вас зовут?',
  });
}

async function finalizeLead({ chatId, userId, user }) {
  const session = getSession(userId);
  const lead = {
    ...session.lead,
    chatId,
    maxUserId: user?.user_id || userId,
    maxUsername: user?.username || '',
    createdAt: new Date().toISOString(),
  };

  await saveLead(lead);
  await sendLeadEmail(lead);
  resetSession(userId);

  await sendMessage({
    chatId,
    text: getFinishText(),
    buttons: getFinishButtons(),
  });
}

async function handleTextMessage(update) {
  const chatId = update.chat_id;
  const user = update.user || {};
  const userId = user.user_id;
  const text = String(update.message?.body?.text || '').trim();
  const session = getSession(userId);

  if (!text) {
    await sendWelcome(chatId);
    return;
  }

  if (text === '/start') {
    await sendWelcome(chatId);
    return;
  }

  if (session.step === 'waiting_name') {
    session.lead.name = text;
    session.step = 'waiting_phone';

    await sendMessage({
      chatId,
      text: 'Напишите ваш номер телефона для связи.',
    });
    return;
  }

  if (session.step === 'waiting_phone') {
    const phone = normalizePhone(text);

    if (!phone) {
      await sendMessage({
        chatId,
        text: 'Не смог нормально распознать номер. Отправьте телефон ещё раз в формате +7XXXXXXXXXX.',
      });
      return;
    }

    session.lead.phone = phone;
    session.step = 'waiting_telegram';

    await sendMessage({
      chatId,
      text: 'Укажите ваш Telegram username, если он есть.',
      buttons: getTelegramButtons(),
    });
    return;
  }

  if (session.step === 'waiting_telegram') {
    session.lead.telegram = normalizeTelegram(text);
    await finalizeLead({ chatId, userId, user });
    return;
  }

  await sendWelcome(chatId);
}

async function handleCallback(update) {
  const chatId = update.chat_id;
  const user = update.user || {};
  const userId = user.user_id;
  const payload = String(update.callback?.payload || '').trim();

  if (payload === 'start_lead_form') {
    await startLeadForm(chatId, userId);
    return;
  }

  if (payload === 'skip_telegram') {
    const session = getSession(userId);
    session.lead.telegram = '';
    await finalizeLead({ chatId, userId, user });
    return;
  }

  await sendWelcome(chatId);
}

async function handleUpdate(update) {
  const type = update.update_type;

  if (type === 'bot_started') {
    await sendWelcome(update.chat_id);
    return;
  }

  if (type === 'message_created') {
    await handleTextMessage(update);
    return;
  }

  if (type === 'message_callback') {
    await handleCallback(update);
  }
}

module.exports = {
  handleUpdate,
};
