/**
 * TaskPilot Telegram Bot — Vercel Serverless Webhook Handler
 * 
 * Route: POST /api/telegram
 * When deployed to Vercel, Telegram pushes updates directly to this serverless function.
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const TASKPILOT_SECRET = process.env.VITE_TASKPILOT_SECRET || process.env.TASKPILOT_SECRET || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ALLOWED_USERS = (process.env.TELEGRAM_ALLOWED_USERS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || 'placeholder-key',
  {
    global: {
      headers: TASKPILOT_SECRET ? { 'x-taskpilot-key': TASKPILOT_SECRET } : {},
    },
  }
);

const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function callTelegram(method, params = {}) {
  const url = `${TELEGRAM_API_BASE}/${method}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram API request to ${method} failed:`, err.message);
    return { ok: false, error: err.message };
  }
}

async function sendMessage(chatId, text, parseMode = 'HTML') {
  const res = await callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
    disable_web_page_preview: true,
  });

  if (!res.ok && parseMode === 'HTML') {
    const plainText = text.replace(/<[^>]*>/g, '');
    return await callTelegram('sendMessage', {
      chat_id: chatId,
      text: plainText,
    });
  }
  return res;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isAuthorized(user) {
  if (ALLOWED_USERS.length === 0) return true;
  if (!user) return false;
  const userIdStr = String(user.id);
  const username = (user.username || '').toLowerCase();
  return ALLOWED_USERS.includes(userIdStr) || (username && ALLOWED_USERS.includes(username));
}

async function getNextTskNumber() {
  const { data, error } = await supabase.from('tasks').select('tsk_number');
  if (error || !data) return '0001';

  const used = new Set(data.map((r) => String(r.tsk_number || '').padStart(4, '0')));
  for (let i = 1; i <= 9999; i++) {
    const candidate = String(i).padStart(4, '0');
    if (!used.has(candidate)) return candidate;
  }
  return '0000';
}

function calculateDueDate(cadence) {
  const d = new Date();
  if (cadence === 'HOURLY') {
    d.setHours(d.getHours() + 1);
  } else if (cadence === 'DAILY') {
    d.setHours(23, 59, 0, 0);
  } else {
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 0, 0);
  }
  return d.toISOString();
}

function parseTaskInput(rawText, defaultStatus = 'TODO') {
  let text = rawText.trim();
  let quadrant = 'NOT_URGENT_IMPORTANT';
  let cadence = 'DAILY';
  let status = defaultStatus;

  if (/#q1|\burgent\s*(&|\+|and)\s*important\b/i.test(text)) {
    quadrant = 'URGENT_IMPORTANT';
  } else if (/#q2|\bnot urgent\s*(&|\+|and)\s*important\b|#important\b/i.test(text)) {
    quadrant = 'NOT_URGENT_IMPORTANT';
  } else if (/#q3|\burgent\s*(&|\+|and)\s*not important\b|#urgent\b/i.test(text)) {
    quadrant = 'URGENT_NOT_IMPORTANT';
  } else if (/#q4|\blow\b|#low\b|#trivial\b/i.test(text)) {
    quadrant = 'NOT_URGENT_NOT_IMPORTANT';
  }

  if (/#hourly\b|#1h\b|\bhourly\b/i.test(text)) {
    cadence = 'HOURLY';
  } else if (/#daily\b|#24h\b|\bdaily\b/i.test(text)) {
    cadence = 'DAILY';
  } else if (/#weekly\b|#7d\b|\bweekly\b/i.test(text)) {
    cadence = 'WEEKLY';
  }

  if (/#backlog\b/i.test(text)) {
    status = 'BACKLOG';
  }

  const cleanLine = text
    .replace(/#(q[1-4]|urgent|important|hourly|daily|weekly|1h|24h|7d|backlog|low|trivial)\b/gi, '')
    .trim();

  const lines = cleanLine.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = lines[0] || 'Untitled Task';
  const description = lines.slice(1).join('\n') || '';

  return { title, description, quadrant, cadence, status };
}

function formatQuadrantLabel(quadrant) {
  switch (quadrant) {
    case 'URGENT_IMPORTANT':
      return '🔥 Q1: Urgent &amp; Important';
    case 'NOT_URGENT_IMPORTANT':
      return '⭐ Q2: Important';
    case 'URGENT_NOT_IMPORTANT':
      return '⚡ Q3: Urgent';
    case 'NOT_URGENT_NOT_IMPORTANT':
      return '🌱 Q4: Low Priority';
    default:
      return quadrant;
  }
}

function formatShortDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today at ${timePart}`;
  const datePart = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${datePart}, ${timePart}`;
}

async function handleTasks(chatId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .in('status', ['TODO', 'IN_PROGRESS', 'DONE'])
    .order('due_at', { ascending: true });

  if (error) {
    return sendMessage(chatId, `❌ <b>Database Error:</b> ${escapeHtml(error.message)}`);
  }

  if (!data || data.length === 0) {
    return sendMessage(
      chatId,
      '📋 <b>Active Board is Empty</b>\n\nNo pending tasks found. Create one with <code>/task &lt;details&gt;</code>!'
    );
  }

  const total = data.length;
  let reply = `📋 <b>Active Board Tasks (${total})</b>\n\n`;

  for (const t of data) {
    const key = `TSK-${String(t.tsk_number).padStart(4, '0')}`;
    const statusEmoji = t.status === 'IN_PROGRESS' ? '⏳' : t.status === 'DONE' ? '✅' : '📌';
    const quad = formatQuadrantLabel(t.quadrant);
    const due = formatShortDate(t.due_at);

    reply += `${statusEmoji} <b>[${key}]</b> ${escapeHtml(t.title)}\n`;
    reply += `   <i>Status:</i> ${t.status} | <i>Due:</i> ${due}\n`;
    reply += `   <i>Priority:</i> ${quad}\n\n`;
  }

  reply += `💡 <i>Tip: Send <code>/done &lt;tsk-number&gt;</code> to mark any task complete.</i>`;
  await sendMessage(chatId, reply);
}

async function handleBacklog(chatId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'BACKLOG')
    .order('created_at', { ascending: false });

  if (error) {
    return sendMessage(chatId, `❌ <b>Database Error:</b> ${escapeHtml(error.message)}`);
  }

  if (!data || data.length === 0) {
    return sendMessage(
      chatId,
      '📥 <b>Backlog is Empty</b>\n\nNo backlog tickets found. Add one with <code>/backlog_add &lt;title&gt;</code> or <code>/task &lt;title&gt; #backlog</code>!'
    );
  }

  const total = data.length;
  let reply = `📥 <b>TaskPilot Backlog (${total})</b>\n\n`;

  for (const t of data) {
    const key = `TSK-${String(t.tsk_number).padStart(4, '0')}`;
    const quad = formatQuadrantLabel(t.quadrant);

    reply += `▫️ <b>[${key}]</b> ${escapeHtml(t.title)}\n`;
    reply += `   <i>Priority:</i> ${quad} | <i>Cadence:</i> ${t.cadence}\n\n`;
  }

  await sendMessage(chatId, reply);
}

async function handleCreateTask(chatId, rawDetails, defaultStatus = 'TODO') {
  if (!rawDetails || !rawDetails.trim()) {
    return sendMessage(
      chatId,
      '⚠️ <b>Missing task details.</b>\n\nUsage:\n<code>/task Refactor login flow #urgent #daily</code>\nor simply:\n<code>/Your task title here</code>'
    );
  }

  const parsed = parseTaskInput(rawDetails, defaultStatus);
  const nextTskNumber = await getNextTskNumber();
  const id = crypto.randomUUID();
  const dueAt = calculateDueDate(parsed.cadence);
  const createdAt = new Date().toISOString();

  const taskRow = {
    id,
    tsk_number: nextTskNumber,
    title: parsed.title,
    description: parsed.description,
    quadrant: parsed.quadrant,
    status: parsed.status,
    cadence: parsed.cadence,
    due_at: dueAt,
    completed_at: null,
    archived_from: null,
    archived_at: null,
    created_at: createdAt,
  };

  const { error } = await supabase.from('tasks').insert([taskRow]);

  if (error) {
    return sendMessage(chatId, `❌ <b>Failed to create task:</b> ${escapeHtml(error.message)}`);
  }

  const key = `TSK-${nextTskNumber}`;
  const statusLabel = parsed.status === 'BACKLOG' ? '📥 Backlog' : '📌 Board (TODO)';
  const quadLabel = formatQuadrantLabel(parsed.quadrant);
  const dueLabel = formatShortDate(dueAt);

  let reply = `✅ <b>Created [${key}]</b>\n\n`;
  reply += `🎯 <b>Title:</b> ${escapeHtml(parsed.title)}\n`;
  if (parsed.description) {
    reply += `📝 <b>Details:</b> ${escapeHtml(parsed.description)}\n`;
  }
  reply += `📍 <b>Destination:</b> ${statusLabel}\n`;
  reply += `🏷️ <b>Quadrant:</b> ${quadLabel}\n`;
  reply += `⏰ <b>Cadence:</b> ${parsed.cadence} (Due: ${dueLabel})`;

  await sendMessage(chatId, reply);
}

async function handleMarkDone(chatId, tskNumberArg) {
  if (!tskNumberArg || !tskNumberArg.trim()) {
    return sendMessage(chatId, '⚠️ Please provide a task number, e.g.: <code>/done 0101</code>');
  }

  const digits = tskNumberArg.replace(/\D/g, '');
  if (!digits) {
    return sendMessage(chatId, '⚠️ Invalid task number format. Example: <code>/done 0101</code>');
  }
  const tskNumber = String(parseInt(digits, 10)).padStart(4, '0');

  const { data: task, error: findError } = await supabase
    .from('tasks')
    .select('id, title, status')
    .eq('tsk_number', tskNumber)
    .single();

  if (findError || !task) {
    return sendMessage(chatId, `❌ Task <b>TSK-${tskNumber}</b> not found.`);
  }

  const completedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      status: 'DONE',
      completed_at: completedAt,
    })
    .eq('id', task.id);

  if (updateError) {
    return sendMessage(chatId, `❌ Failed to update task: ${escapeHtml(updateError.message)}`);
  }

  await sendMessage(
    chatId,
    `🎉 <b>Task Marked Done!</b>\n\n✅ <b>[TSK-${tskNumber}]</b> ${escapeHtml(task.title)}`
  );
}

async function handleHelp(chatId) {
  let help = `🤖 <b>TaskPilot Telegram Assistant</b>\n\n`;
  help += `<b>Available Commands:</b>\n`;
  help += `• <code>/tasks</code> — View all active tasks on the Board\n`;
  help += `• <code>/backlog</code> — View all Backlog tickets\n`;
  help += `• <code>/task &lt;details&gt;</code> — Create a new Board task\n`;
  help += `• <code>/backlog_add &lt;details&gt;</code> — Add item directly to Backlog\n`;
  help += `• <code>/done &lt;number&gt;</code> — Complete a task (e.g. <code>/done 0102</code>)\n`;
  help += `• <code>/help</code> — Show this guide\n\n`;

  help += `✨ <b>Quick Task Creation:</b>\n`;
  help += `You can type <code>/&lt;task-details&gt;</code> directly!\n`;
  help += `<i>Example:</i> <code>/Fix navigation bar glitch</code>\n\n`;

  help += `🏷️ <b>Smart Hashtags:</b>\n`;
  help += `• <b>Priority:</b> <code>#urgent</code>, <code>#important</code>, <code>#q1</code>, <code>#q2</code>, <code>#q3</code>, <code>#q4</code>\n`;
  help += `• <b>Cadence:</b> <code>#hourly</code>, <code>#daily</code>, <code>#weekly</code>\n`;
  help += `• <b>Destination:</b> <code>#backlog</code> (puts directly in Backlog)\n\n`;

  await sendMessage(chatId, help);
}

async function handleMessage(message) {
  const chatId = message.chat?.id;
  const user = message.from;
  const text = (message.text || '').trim();

  if (!chatId || !text) return;

  if (!isAuthorized(user)) {
    return sendMessage(chatId, '⛔ <b>Unauthorized:</b> You are not authorized to access this TaskPilot bot.');
  }

  if (text.startsWith('/')) {
    const spaceIndex = text.indexOf(' ');
    const commandPart = spaceIndex === -1 ? text.slice(1) : text.slice(1, spaceIndex);
    const args = spaceIndex === -1 ? '' : text.slice(spaceIndex + 1).trim();
    const cleanCommand = commandPart.split('@')[0].toLowerCase();

    switch (cleanCommand) {
      case 'start':
      case 'help':
        return await handleHelp(chatId);
      case 'tasks':
      case 'board':
        return await handleTasks(chatId);
      case 'backlog':
      case 'backlogs':
        return await handleBacklog(chatId);
      case 'task':
      case 'new':
      case 'add':
      case 'todo':
        return await handleCreateTask(chatId, args, 'TODO');
      case 'backlog_add':
      case 'add_backlog':
        return await handleCreateTask(chatId, args, 'BACKLOG');
      case 'done':
      case 'complete':
        return await handleMarkDone(chatId, args);
      default: {
        let fullTaskDetails = text.slice(1).trim();
        if (fullTaskDetails.startsWith('{') && fullTaskDetails.endsWith('}')) {
          fullTaskDetails = fullTaskDetails.slice(1, -1).trim();
        }
        return await handleCreateTask(chatId, fullTaskDetails, 'TODO');
      }
    }
  } else {
    return sendMessage(
      chatId,
      `❓ Did you mean to create a task? Type:\n<code>/task ${escapeHtml(text)}</code>\n\nOr type <code>/help</code> for available commands.`
    );
  }
}

// Vercel Serverless Function Handler
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send('TaskPilot Telegram Bot Webhook is online and healthy.');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const update = req.body;
    if (update && update.message) {
      await handleMessage(update.message);
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(200).json({ ok: false, error: error.message });
  }
}

