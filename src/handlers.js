const { getSession, resetSession } = require('./state');
const { saveLead, findRecentDuplicateLead } = require('./storage');
const { sendLeadEmail } = require('./mailer');
const { sendMessage } = require('./maxApi');
const { normalizePhone, normalizeTelegram, normalizeName } = require('./validators');
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

function getChatId(update) {
  return update.chat_id || update.message?.recipient?.chat_id || update.callback?.chat_id || null;
}

function getUser(update) {
  return update.user || update.callback?.user || update.message?.sender || {};
}

function getStartPayload(update) {
  return String(update.payload || update.start_payload || update.startPayload || '').trim();
}

function preserveSource(session, source) {
  if (source) {
    session.lead.source = source;
  }
}

async function sendWelcome(chatId, userId, source = '') {
  const session = resetSession(userId);
  preserveSource(session, source);

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
    text: '👤 Пожалуйста, напишите ваше имя',
  });
}

async function askPhone(chatId, userId, name) {
  const session = getSession(userId);
  session.lead.name = name;
  session.step = 'waiting_phone';

  await sendMessage({
    chatId,
    text: '📞 Пожалуйста, укажите ваш номер телефона',
  });
}

async function askTelegram(chatId, userId, phone) {
  const session = getSession(userId);
  session.lead.phone = phone;
  session.step = 'waiting_telegram';

  await sendMessage({
    chatId,
    text: '📨 Пожалуйста, укажите ваш ник в Telegram, если он есть\n\nЕсли Telegram нет — просто нажмите «Пропустить» ✨',
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

  try {
    const duplicate = await findRecentDuplicateLead({
      maxUserId: lead.maxUserId,
      phone: lead.phone,
    });

    if (duplicate) {
      await sendMessage({
        chatId,
        text: 'Мы уже получили вашу заявку 💛\n\nЕсли нужно уточнить данные, пожалуйста, напишите нам напрямую или попробуйте позже.',
      });
      console.log(`Duplicate lead blocked by ${duplicate.type}`);
      return;
    }

    await saveLead(lead);
    await sendLeadEmail(lead);
    resetSession(userId);

    await sendMessage({
      chatId,
      text: getFinalText(),
    });

    console.log('Lead finalized successfully');
  } catch (error) {
    console.error('Finalize lead failed:', error);

    await sendMessage({
      chatId,
      text: '⚠️ Заявка не отправилась из-за технической ошибки.\n\nПопробуйте ещё раз чуть позже или напишите нам напрямую.',
    });

    throw error;
  }
}

function getIncomingText(update) {
  return String(update.message?.body?.text || update.message?.text || update.text || '').trim();
}

async function handleTextMessage(update) {
  const chatId = getChatId(update);
  const user = getUser(update);
  const userId = user.user_id;
  const text = getIncomingText(update);
  const session = getSession(userId);

  if (!text) {
    await sendWelcome(chatId, userId, getStartPayload(update));
    return;
  }

  if (text === '/start') {
    await sendWelcome(chatId, userId, getStartPayload(update));
    return;
  }

  if (text === 'Продолжить') {
    await askName(chatId, userId);
    return;
  }

  if (session.step === 'waiting_name') {
    const name = normalizeName(text);

    if (!name) {
      await sendMessage({
        chatId,
        text: '👤 Пожалуйста, укажите корректное имя:\nтолько буквы и минимум 2 символа 💛',
      });
      return;
    }

    await askPhone(chatId, userId, name);
    return;
  }

  if (session.step === 'waiting_phone') {
    const phone = normalizePhone(text);

    if (!phone) {
      await sendMessage({
        chatId,
        text: '📞 Не смогла распознать номер.\n\nПожалуйста, отправьте его ещё раз в формате: *+7XXXXXXXXXX*',
      });
      return;
    }

    await askTelegram(chatId, userId, phone);
    return;
  }

  if (session.step === 'waiting_telegram') {
    const telegram = normalizeTelegram(text);

    if (telegram === null) {
      await sendMessage({
        chatId,
        text: '📨 Пожалуйста, укажите корректный ник в Telegram в формате *@username*\nили нажмите «Пропустить» ✨',
        buttons: getTelegramButtons(),
      });
      return;
    }

    await askToSaveStudioPhone(chatId, userId, telegram);
    return;
  }

  await sendWelcome(chatId, userId, session.lead.source);
}

function getCallbackPayload(update) {
  return String(
    update.callback?.payload ||
      update.callback?.data ||
      update.message?.callback?.payload ||
      update.message?.callback?.data ||
      update.message?.body?.callback?.payload ||
      update.message?.body?.callback?.data ||
      update.message?.body?.text ||
      update.message?.text ||
      update.text ||
      update.payload ||
      ''
  ).trim();
}

async function handleCallback(update) {
  const chatId = getChatId(update);
  const user = getUser(update);
  const userId = user.user_id;
  const payload = getCallbackPayload(update);

  console.log('MAX callback payload:', payload || '<empty>');

  if (payload === 'continue_flow' || payload === 'Продолжить') {
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
    await sendWelcome(chatId, userId, getSession(userId).lead.source);
    return;
  }

  await sendWelcome(chatId, userId, getSession(userId).lead.source);
}

async function handleUpdate(update) {
  const type = update.update_type;

  console.log('MAX update type:', type);

  if (type === 'bot_started') {
    const source = getStartPayload(update);
    if (source) {
      console.log('MAX start payload:', source);
    }

    await sendWelcome(getChatId(update), getUser(update)?.user_id, source);
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
