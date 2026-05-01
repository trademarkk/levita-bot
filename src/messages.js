const config = require('./config');

function getStartText() {
  return [
    'Приветствую тебя, наша будущая ученица! 💛',
    'Я бот студии балета и растяжки LEVITA (Краснодар)',
    '',
    'Начни путь к гибкости, красивой осанке и лёгкости в теле 💫',
    'Без подготовки — в комфортной и поддерживающей атмосфере.',
    '',
    'Продолжая использование, вы даёте [согласие](https://drive.google.com/file/d/1OM3Ix-suWSWmgMpC2b4imnusEPzMlzlx/view?usp=sharing) на обработку персональных данных.',
  ].join('\n');
}

function getStartButtons() {
  return [[{ type: 'callback', text: 'Продолжить ✨', payload: 'continue_flow' }]];
}

function getTelegramButtons() {
  return [[{ type: 'callback', text: 'Пропустить 🌿', payload: 'skip_telegram' }]];
}

function getSavePhoneText() {
  return [
    '📲 *Телефон студии*',
    `*${config.studioPhone}*`,
    '',
    'Пожалуйста, сохраните его в контакты, чтобы мы могли написать вам в MAX 💛',
    '',
    'Когда сохраните номер, нажмите кнопку ниже — и перейдём к подтверждению заявки ✨',
  ].join('\n');
}

function getSavePhoneButtons() {
  return [
    [{ type: 'clipboard', text: 'Скопировать номер 📋', payload: config.studioPhone }],
    [{ type: 'callback', text: 'Номер сохранён 💛', payload: 'saved_studio_phone' }],
  ];
}

function getConfirmText(lead) {
  const lines = [
    '✨ *Проверьте, пожалуйста, ваши данные*',
    '',
    `👤 Имя: *${lead.name || '-'}*`,
    `📞 Номер телефона: *${lead.phone || '-'}*`,
    `📨 Ник в Telegram: *${lead.telegram || 'не указан'}*`,
    '',
    'Если всё верно, нажмите *«Подтвердить»* 💛',
  ];

  return lines.join('\n');
}

function getConfirmButtons() {
  return [
    [{ type: 'callback', text: 'Подтвердить заявку 💫', payload: 'confirm_lead' }],
    [{ type: 'callback', text: 'Заполнить заново ↺', payload: 'restart_flow' }],
  ];
}

function getFinalText() {
  return 'Благодарим за выбор нашей студии! 💛\n\nС вами в самое ближайшее время свяжется наш заботливый менеджер.\nПожалуйста, ответьте на звонок 🙏';
}

module.exports = {
  getStartText,
  getStartButtons,
  getTelegramButtons,
  getSavePhoneText,
  getSavePhoneButtons,
  getConfirmText,
  getConfirmButtons,
  getFinalText,
};
