// utils/emojis.js
const data = require('./emojis.json');

function parse(emojiStr) {
  const match = emojiStr.match(/^<(a)?:(\w+):(\d+)>$/);
  if (!match) return { name: emojiStr };
  return { id: match[3], name: match[2], animated: !!match[1] };
}

function fmt(emoji) {
  if (!emoji) return '';
  if (emoji.animated) return `<a:${emoji.name}:${emoji.id}>`;
  return `<:${emoji.name}:${emoji.id}>`;
}

const emojis = {};
for (const [key, value] of Object.entries(data)) {
  emojis[key] = parse(value);
}

emojis.fmt = fmt; // ✅ exporta junto com os emojis

module.exports = emojis;