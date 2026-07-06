import Mailgun from 'mailgun.js';
import FormData from 'form-data';

export interface SendMailInput {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export interface TicketRaiseEmailInput {
  ticketId: number;
  projectName: string;
  raisedByUsername: string;
  raisedByEmail: string;
  ticketUrl?: string;
  ticketComments?: string;
}

export interface TicketStatusChangeEmailInput {
  ticketId: number;
  projectName: string;
  oldStatus: string;
  newStatus: string;
  changedByUsername: string;
  changedByEmail: string;
  ticketUrl?: string;
  ticketComments?: string;
}

export interface ProjectStatusChangeEmailInput {
  projectId: number;
  projectName: string;
  projectNo?: string;
  client?: string;
  oldStatus: string;
  newStatus: string;
  changedByUsername: string;
  changedByEmail: string;
}

export interface WelcomeEmailInput {
  username: string;
  email: string;
  role: string;
}

/** Map ticket status codes to display labels */
function ticketStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    '1': 'In Progress',
    '2': 'Completed',
    '3': 'Under Revision',
  };
  return labels[status] || 'Unknown';
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/** ── Shared email wrapper ── */
function emailWrapper(headerIcon: string, headerTitle: string, bodyHtml: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden;">
      <div style="padding: 28px 24px; background: linear-gradient(135deg, #1a3a5c, #2a5a8c); text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">${esc(headerTitle)}</h1>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #cbd5e1; font-weight: 500; letter-spacing: 0.5px;">BIM-IQ | Clove Technologies</p>
      </div>
      
      <div style="padding: 24px;">
        ${bodyHtml}
      </div>
      
      <div style="padding: 14px 24px; background: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 500;">BIM-IQ · Digital Twin Platform</p>
      </div>
    </div>
  `;
}

function row(label: string, value: string, opts?: { color?: string; mono?: boolean }): string {
  const color = opts?.color ? `color: ${opts.color};` : 'color: #334155;';
  const fontFamily = opts?.mono ? 'font-family: Courier, monospace;' : '';
  
  return `
    <tr>
      <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #1e293b; background: #f8fafc; border: 1px solid #cbd5e1; width: 30%;">${esc(label)}</td>
      <td style="padding: 10px 14px; font-size: 13px; border: 1px solid #cbd5e1; ${fontFamily} ${color}">${value}</td>
    </tr>`;
}

/**
 * Send a ticket raised notification email.
 * Reads TICKET_RAISE_TO, TICKET_RAISE_CC, TICKET_RAISE_BCC from environment variables.
 */
export async function sendTicketRaiseEmail(input: TicketRaiseEmailInput): Promise<{ id?: string; message?: string; status: number }> {
  const to = process.env['TICKET_RAISE_TO'] || '';

  const ccRaw = process.env['TICKET_RAISE_CC'] || '';
  const bccRaw = process.env['TICKET_RAISE_BCC'] || '';
  const cc = ccRaw ? ccRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;
  const bcc = bccRaw ? bccRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;

  const subject = `[BIM-IQ] Ticket Raised — ${input.projectName}`;

  const urlLink = input.ticketUrl ? esc(input.ticketUrl) : '';
  const comments = input.ticketComments ? esc(input.ticketComments) : '';

  let rows = row('Project', esc(input.projectName));
  rows += row('Raised By', `${esc(input.raisedByUsername)} (<a href="mailto:${esc(input.raisedByEmail)}" style="color: #205493; text-decoration: none; font-weight: 600;">${esc(input.raisedByEmail)}</a>)`);
  // rows += row('Ticket ID', `#${input.ticketId}`, { color: '#b91c1c', mono: true }); // Uses a crisp red context for Ticket ID accenting

  if (urlLink) {
    rows += row('Attachment', `<a href="${urlLink}" style="color: #205493; text-decoration: underline; word-break: break-all;">${urlLink}</a>`);
  }
  if (comments) {
    rows += row('Comments', esc(comments), { color: '#4b5563' });
  }

  // Section heading setup matching the image style
  const bodyHtml = `
    <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #205493;">
      <h2 style="margin: 0; font-size: 15px; font-weight: 700; color: #205493;">Ticket Specifications</h2>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;  box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
      ${rows}
    </table>
  `;

  const html = emailWrapper('🎫', 'Ticket Request', bodyHtml);

  return sendMail({
    to,
    ...(cc?.length ? { cc } : {}),
    ...(bcc?.length ? { bcc } : {}),
    subject,
    html,
  });
}

/**
 * Send a ticket status change notification email.
 * Reads TICKET_STATUS_CHANGE_TO, TICKET_RAISE_CC, TICKET_RAISE_BCC from environment variables.
 */
export async function sendTicketStatusChangeEmail(input: TicketStatusChangeEmailInput): Promise<{ id?: string; message?: string; status: number }> {
  const to = process.env['TICKET_STATUS_CHANGE_TO'] || '';

  const ccRaw = process.env['TICKET_STATUS_CHANGE_CC'] || '';
  const bccRaw = process.env['TICKET_STATUS_CHANGE_BCC'] || '';
  const cc = ccRaw ? ccRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;
  const bcc = bccRaw ? bccRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;

  const subject = `[BIM-IQ] Ticket Status Updated — ${input.projectName}`;

  const oldLabel = ticketStatusLabel(input.oldStatus);
  const newLabel = ticketStatusLabel(input.newStatus);
  const urlLink = input.ticketUrl ? esc(input.ticketUrl) : '';
  const comments = input.ticketComments ? esc(input.ticketComments) : '';

  const statusColor = input.newStatus === '2' ? '#22c55e' : '#f59e0b';

  let rows = row('Project', esc(input.projectName));
  rows += row('Old Status', esc(oldLabel), { color: '#ef4444' });
  rows += row('New Status', `<span style="display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 4px; background: ${statusColor}15; color: ${statusColor}; font-weight: 700;">${esc(newLabel)}</span>`);
  rows += row('Changed By', `${esc(input.changedByUsername)} (<a href="mailto:${esc(input.changedByEmail)}" style="color: #205493; text-decoration: none; font-weight: 600;">${esc(input.changedByEmail)}</a>)`);

  if (urlLink) {
    rows += row('Attachment', `<a href="${urlLink}" style="color: #205493; text-decoration: underline; word-break: break-all;">${urlLink}</a>`);
  }
  if (comments) {
    rows += row('Comments', esc(comments), { color: '#4b5563' });
  }

  const bodyHtml = `
    <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #205493;">
      <h2 style="margin: 0; font-size: 15px; font-weight: 700; color: #205493;">Ticket #${input.ticketId} — Status Change</h2>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
      ${rows}
    </table>
  `;

  const html = emailWrapper('🔄', 'Ticket Status Updated', bodyHtml);

  return sendMail({
    to,
    ...(cc?.length ? { cc } : {}),
    ...(bcc?.length ? { bcc } : {}),
    subject,
    html,
  });
}

/**
 * Send a project workflow status change notification email.
 * Reads PROJECT_STATUS_CHANGE_TO, PROJECT_STATUS_CHANGE_CC, PROJECT_STATUS_CHANGE_BCC from environment variables.
 */
export async function sendProjectStatusChangeEmail(input: ProjectStatusChangeEmailInput): Promise<{ id?: string; message?: string; status: number }> {
  const to = process.env['PROJECT_STATUS_CHANGE_TO'] || '';

  const ccRaw = process.env['PROJECT_STATUS_CHANGE_CC'] || '';
  const bccRaw = process.env['PROJECT_STATUS_CHANGE_BCC'];
  const cc = ccRaw ? ccRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;
  const bcc = bccRaw ? bccRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;

  const subject = `[BIM-IQ] Project Status Updated — ${input.projectName}`;

  const statusColorMap: Record<string, string> = {
    'Yet to Award': '#94a3b8',
    'In Progress': '#3b82f6',
    'Under Revision': '#a855f7',
    'Completed': '#22c55e',
  };
  const oldColor = statusColorMap[input.oldStatus] || '#6b7280';
  const newColor = statusColorMap[input.newStatus] || '#6b7280';

  let rows = row('Project', esc(input.projectName));
  if (input.projectNo) rows += row('Project ID', esc(input.projectNo), { mono: true });
  if (input.client) rows += row('Client', esc(input.client));
  rows += row('Old Status', `<span style="color: ${oldColor}; font-weight: 600;">${esc(input.oldStatus)}</span>`);
  rows += row('New Status', `<span style="display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 4px; background: ${newColor}15; color: ${newColor}; font-weight: 700;">${esc(input.newStatus)}</span>`);
  rows += row('Changed By', `${esc(input.changedByUsername)} (<a href="mailto:${esc(input.changedByEmail)}" style="color: #205493; text-decoration: none; font-weight: 600;">${esc(input.changedByEmail)}</a>)`);

  const bodyHtml = `
    <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #205493;">
      <h2 style="margin: 0; font-size: 15px; font-weight: 700; color: #205493;">Project #${input.projectId} — Status Change</h2>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
      ${rows}
    </table>
  `;

  const html = emailWrapper('📋', 'Project Status Updated', bodyHtml);

  return sendMail({
    to,
    ...(cc?.length ? { cc } : {}),
    ...(bcc?.length ? { bcc } : {}),
    subject,
    html,
  });
}


export async function sendMail(input: SendMailInput): Promise<{ id?: string; message?: string; status: number }> {
  const apiKey = process.env['MAILGUN_API_KEY'] || '';
  const domain = process.env['MAILGUN_DOMAIN'] || 'axisxd.com';
  const from = process.env['MAILGUN_FROM'] || `noreply@axisxd.com`;

  if (!apiKey) {
    console.warn('[Mail] MAILGUN_API_KEY not set — skipping email send');
    return { status: 200, message: 'Skipped (no API key)' };
  }

  // Skip if no recipients are configured
  const toList = Array.isArray(input.to) ? input.to : [input.to];
  if (toList.every(r => !r)) {
    console.warn('[Mail] No recipients configured — skipping email send');
    return { status: 200, message: 'Skipped (no recipients)' };
  }

  try {
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: 'api',
      key: apiKey,
      url: process.env['MAILGUN_EU'] === 'true' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net',
    });
    const result = await mg.messages.create(domain, {
      from,
      to: input.to,
      ...(input.cc ? { cc: input.cc } : {}),
      ...(input.bcc ? { bcc: input.bcc } : {}),
      subject: input.subject,
      text: input.text || '',
      html: input.html || '',
    });
    console.log(`[Mail] Sent to ${input.to}: ${from}, ${result.message}`);
    return result;
  } catch (err) {
    console.error('[Mail] Failed to send email:', err);
    throw err;
  }
}
