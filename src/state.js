const sessions = new Map();

function createEmptySession() {
  return {
    step: 'idle',
    lead: {
      name: '',
      phone: '',
      telegram: '',
    },
  };
}

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, createEmptySession());
  }

  return sessions.get(userId);
}

function resetSession(userId) {
  const session = createEmptySession();
  sessions.set(userId, session);
  return session;
}

module.exports = {
  getSession,
  resetSession,
};
