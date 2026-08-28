const { db } = require('./database');
const crypto = require('crypto');

function generateKey() {
  return crypto.randomBytes(16).toString('hex');
}

// Chaves temporárias em memória: backupId → key
const pendingKeys = new Map();

function storeKey(backupId, key) {
  pendingKeys.set(backupId, key);
  // Expirar após 10 minutos
  setTimeout(() => pendingKeys.delete(backupId), 10 * 60 * 1000);
}

function validateKey(backupId, key) {
  return pendingKeys.get(backupId) === key;
}

async function createBackup(guild) {
  const channels = guild.channels.cache.map(ch => ({
    id: ch.id,
    name: ch.name,
    type: ch.type,
    parentId: ch.parentId,
    position: ch.position,
    permissionOverwrites: ch.permissionOverwrites?.cache.map(p => ({
      id: p.id,
      type: p.type,
      allow: p.allow.toArray(),
      deny: p.deny.toArray(),
    })) ?? [],
  }));

  const roles = guild.roles.cache
    .filter(r => !r.managed && r.id !== guild.id)
    .map(r => ({
      id: r.id,
      name: r.name,
      color: r.color,
      hoist: r.hoist,
      mentionable: r.mentionable,
      permissions: r.permissions.toArray(),
      position: r.position,
    }));

  const backupData = {
    name: `backup-${Date.now()}`,
    guildId: guild.id,
    guildName: guild.name,
    createdAt: new Date().toISOString(),
    channels,
    roles,
  };

  const backupId = `${guild.id}-${Date.now()}`;
  const key = generateKey();
  storeKey(backupId, key);

  const database = require('./database');
  database.saveBackup(guild.id, backupId, backupData);

  return { backupId, key, backupData };
}

async function restoreBackup(guild, backupData) {
  // Apagar canais existentes
  for (const channel of guild.channels.cache.values()) {
    await channel.delete().catch(() => {});
  }

  // Apagar cargos existentes (exceto @everyone e geridos)
  for (const role of guild.roles.cache.values()) {
    if (role.managed || role.id === guild.id) continue;
    await role.delete().catch(() => {});
  }

  // Recriar cargos ordenados por posição
  const roleMap = new Map();
  const sortedRoles = [...backupData.roles].sort((a, b) => a.position - b.position);
  for (const r of sortedRoles) {
    const newRole = await guild.roles.create({
      name: r.name,
      color: r.color,
      hoist: r.hoist,
      mentionable: r.mentionable,
      permissions: r.permissions,
    }).catch(() => null);
    if (newRole) roleMap.set(r.id, newRole.id);
  }

  // Recriar categorias primeiro
  const categoryMap = new Map();
  const categories = backupData.channels.filter(c => c.type === 4);
  for (const cat of categories) {
    const newCat = await guild.channels.create({
      name: cat.name,
      type: 4,
      position: cat.position,
    }).catch(() => null);
    if (newCat) categoryMap.set(cat.id, newCat.id);
  }

  // Recriar restantes canais
  const otherChannels = backupData.channels
    .filter(c => c.type !== 4)
    .sort((a, b) => a.position - b.position);

  for (const ch of otherChannels) {
    await guild.channels.create({
      name: ch.name,
      type: ch.type,
      parent: ch.parentId ? categoryMap.get(ch.parentId) : null,
      position: ch.position,
    }).catch(() => {});
  }
}

module.exports = { createBackup, validateKey, generateKey, storeKey, restoreBackup };