const { getSession, resetSession } = require('./state');
const { saveLead } = require('./storage');
const { sendLeadEmail } = require('./mailer');
const { sendMessage } = require('./maxApi');
const { normalizePhone, normalizeTelegram } = require('./validators');
const {
  getStartText,
  getStartButtons,
  getTelegramButtons,
  getSavePhoneText,
  getSavePhoneButtons,
  getConfirmText,
  getConfirmButtons,
  getFinalText,
} = require('./messages');

async function sendWelcome(chatId, userId) {
  resetSession(userId);

  await sendMessage({
    chatId,
    text: getStartText(),
    buttons: getStartButtons(),
  });
}

async function askName(chatId, userId) {
  const session = getSession(userId);
  session.step = 'waiting_name';

  await sendMessage({
    chatId,
    text: 'Пожалуйста, напишите ваше имя',
  });
}

async function askPhone(chatId, userId, name) {
  const session = getSession(userId);
  session.lead.name = name;
  session.step = 'waiting_phone';

  await sendMessage({
    chatId,
    text: 'Пожалуйста, укажите ваш номер телефона',
  });
}

async function askTelegram(chatId, userId, phone) {
  const session = getSession(userId);
  session.lead.phone = phone;
  session.step = 'waiting_telegram';

  await sendMessage({
    chatId,
    text: 'Пожалуйста, укажите ваш ник в telegram(при наличии)',
    buttons: getTelegramButtons(),
  });
}

async function askToSaveStudioPhone(chatId, userId, telegram) {
  const session = getSession(userId);
  session.lead.telegram = telegram;
  session.step = 'waiting_save_phone';

  await sendMessage({
    chatId,
    text: getSavePhoneText(),
    buttons: getSavePhoneButtons(),
  });
}

async function askForConfirmation(chatId, userId) {
  const session = getSession(userId);
  session.step = 'waiting_confirmation';

  await sendMessage({
    chatId,
    text: getConfirmText(session.lead),
    buttons: getConfirmButtons(),
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
    text: getFinalText(),
  });
}

async function handleTextMessage(update) {
  const chatId = update.chat_id;
  const user = update.user || {};
  const userId = user.user_id;
  const text = String(update.message?.body?.text || '').trim();
  const session = getSession(userId);

  if (!text) {
    await sendWelcome(chatId, userId);
    return;
  }

  if (text === '/start') {
    await sendWelcome(chatId, userId);
    return;
  }

  if (session.step === 'waiting_name') {
    await askPhone(chatId, userId, text);
    return;
  }

  if (session.step === 'waiting_phone') {
    const phone = normalizePhone(text);

    if (!phone) {
      await sendMessage({
        chatId,
        text: 'Не смогла распознать номер. Пожалуйста, отправьте его ещё раз в формате +7XXXXXXXXXX',
      });
      return;
    }

    await askTelegram(chatId, userId, phone);
    return;
  }

  if (session.step === 'waiting_telegram') {
    await askToSaveStudioPhone(chatId, userId, normalizeTelegram(text));
    return;
  }

  await sendWelcome(chatId, userId);
}

function getCallbackPayload(update) {
  return String(
    update.callback?.payload ||
      update.message?.callback?.payload ||
      update.message?.body?.callback?.payload ||
      update.payload ||
      ''
  ).trim();
}

async function handleCallback(update) {
  const chatId = update.chat_id;
  const user = update.user || {};
  const userId = user.user_id;
  const payload = getCallbackPayload(update);

  console.log('MAX callback payload:', payload || '<empty>');
  console.log('MAX callback raw update:', JSON.stringify(update));

  if (payload === 'continue_flow') {
    await askName(chatId, userId);
    return;
  }

  if (payload === 'skip_telegram') {
    await askToSaveStudioPhone(chatId, userId, '');
    return;
  }

  if (payload === 'saved_studio_phone') {
    await askForConfirmation(chatId, userId);
    return;
  }

  if (payload === 'confirm_lead') {
    await finalizeLead({ chatId, userId, user });
    return;
  }

  if (payload === 'restart_flow') {
    await sendWelcome(chatId, userId);
    return;
  }

  await sendWelcome(chatId, userId);
}

async function handleUpdate(update) {
  const type = update.update_type;

  console.log('MAX update type:', type);

  if (type === 'bot_started') {
    await sendWelcome(update.chat_id, update.user?.user_id);
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
