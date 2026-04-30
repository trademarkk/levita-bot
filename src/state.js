const sessions = new Map();

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      step: 'idle',
      lead: {
        name: '',
        phone: '',
        telegram: '',
      },
    });
  }

  return sessions.get(userId);
}

function resetSession(userId) {
  sessions.set(userId, {
    step: 'idle',
    lead: {
      name: '',
      phone: '',
      telegram: '',
    },
  });

  return sessions.get(userId);
}

module.exports = {
  getSession,
  resetSession,
};
