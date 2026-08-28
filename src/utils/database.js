const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const CONFIG_FILE = path.join(DATA_DIR, 'guilds.json');

// Garantir que a pasta data existe
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(CONFIG_FILE)) fs.writeFileSync(CONFIG_FILE, '{}');

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeAll(data) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

function getGuild(guildId) {
  const all = readAll();
  if (!all[guildId]) all[guildId] = defaultGuildConfig();
  return all[guildId];
}

function setGuild(guildId, config) {
  const all = readAll();
  all[guildId] = config;
  writeAll(all);
}

function updateGuild(guildId, updates) {
  const config = getGuild(guildId);
  const merged = deepMerge(config, updates);
  setGuild(guildId, merged);
  return merged;
}

function defaultGuildConfig() {
  return {
    protection: {
      addBot:        { enabled: false, logChannel: null },
      webhook:       { enabled: false, logChannel: null },
      channelCreate: { enabled: false, logChannel: null },
      massBan:       { enabled: false, logChannel: null, threshold: 3, interval: 10 },
      massKick:      { enabled: false, logChannel: null, threshold: 3, interval: 10 },
    },
    ia: {
      apiKey: null,
      prompt: 'Analisa esta mensagem/imagem e determina se contém conteúdo prejudicial.',
      model: 'grok-beta',
      logChannel: null,
      enabled: false,
    },
    autoMessages: {
      enabled: false,
      channel: null,
      message: null,
      type: 'content', // 'content' ou 'embed'
      cronExpression: '0 * * * *',
    },
    entrada: {
      enabled: false,
      channel: null,
    },
  };
}

// Backup storage
function saveBackup(guildId, backupId, backupData) {
  const backupDir = path.join(DATA_DIR, 'backups', guildId);
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const file = path.join(backupDir, `${backupId}.json`);
  fs.writeFileSync(file, JSON.stringify(backupData, null, 2));
}

function listBackups(guildId) {
  const backupDir = path.join(DATA_DIR, 'backups', guildId);
  if (!fs.existsSync(backupDir)) return [];
  return fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const raw = JSON.parse(fs.readFileSync(path.join(backupDir, f), 'utf8'));
      return { id: f.replace('.json', ''), name: raw.name, createdAt: raw.createdAt };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getBackup(guildId, backupId) {
  const file = path.join(DATA_DIR, 'backups', guildId, `${backupId}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function deleteBackup(guildId, backupId) {
  const file = path.join(DATA_DIR, 'backups', guildId, `${backupId}.json`);
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    return true;
  }
  return false;
}

// Deep merge helper
function deepMerge(target, source) {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

module.exports = {
  getGuild,
  setGuild,
  updateGuild,
  saveBackup,
  listBackups,
  getBackup,
  deleteBackup,
};
