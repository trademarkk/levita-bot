const fs = require('fs/promises');
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
  await fs.writeFile(config.dataFile, JSON.stringify(leads, null, 2), 'utf8');
}

module.exports = {
  saveLead,
};
