const config = require('./config');

function getStartText() {
  return [
    'Оставьте контакты, и администратор студии свяжется с вами.',
    'Это займёт меньше минуты.',
  ].join('\n');
}

function getStartButtons() {
  return [[{ type: 'callback', text: 'Оставить контакты', payload: 'start_lead_form' }]];
}

function getTelegramButtons() {
  return [[{ type: 'callback', text: 'Пропустить', payload: 'skip_telegram' }]];
}

function getFinishText() {
  return [
    'Спасибо, заявку получили.',
    'Администратор свяжется с вами в ближайшее время.',
    '',
    `Телефон студии: *${config.studioPhone}*`,
    'Сохраните его в контакты, чтобы мы могли написать вам в MAX.',
  ].join('\n');
}

function getFinishButtons() {
  return [
    [{ type: 'clipboard', text: 'Скопировать номер', payload: config.studioPhone }],
    [{ type: 'callback', text: 'Оставить новую заявку', payload: 'start_lead_form' }],
  ];
}

module.exports = {
  getStartText,
  getStartButtons,
  getTelegramButtons,
  getFinishText,
  getFinishButtons,
};
