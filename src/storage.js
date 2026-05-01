const fs = require('fs/promises');
const path = require('path');
const config = require('./config');

async function readLeads() {
  try {
    const raw = await fs.readFile(config.dataFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function saveLead(lead) {
  const leads = await readLeads();
  leads.push(lead);

  await fs.mkdir(path.dirname(config.dataFile), { recursive: true });
  await fs.writeFile(config.dataFile, JSON.stringify(leads, null, 2), 'utf8');
}

function isWithinMs(dateString, windowMs) {
  const timestamp = new Date(dateString).getTime();

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return Date.now() - timestamp <= windowMs;
}

async function findRecentDuplicateLead({ maxUserId, phone }) {
  const leads = await readLeads();

  const duplicateByUser = leads.find(
    (lead) => lead.maxUserId === maxUserId && isWithinMs(lead.createdAt, 30 * 60 * 1000)
  );

  if (duplicateByUser) {
    return {
      type: 'user',
      lead: duplicateByUser,
    };
  }

  const duplicateByPhone = leads.find(
    (lead) => lead.phone === phone && isWithinMs(lead.createdAt, 24 * 60 * 60 * 1000)
  );

  if (duplicateByPhone) {
    return {
      type: 'phone',
      lead: duplicateByPhone,
    };
  }

  return null;
}

module.exports = {
  saveLead,
  findRecentDuplicateLead,
};
