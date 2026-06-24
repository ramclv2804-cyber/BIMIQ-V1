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

export interface QuoteRequestEmailInput {
  projectName: string;
  requesterName: string;
  requesterEmail: string;
  serviceType: string;
  area: string;
  buildingType: string;
  requirements: string;
  description?: string;
  totalEstimate: string;
  currency: string;
  uploadLink?: string;
  pointCloudLink?: string;
}

export interface OrderConfirmationEmailInput {
  projectName: string;
  clientName: string;
  clientEmail: string;
  orderNumber: string;
  serviceType: string;
  area: string;
  buildingType: string;
  lodLevel?: string;
  requirements: string;
  totalAmount: string;
  currency: string;
  estimatedDelivery: string;
  orderDate: string;
}

export interface ProjectStatusEmailInput {
  projectName: string;
  clientName: string;
  clientEmail: string;
  projectNumber: string;
  status: string;
  previousStatus: string;
  serviceType: string;
  updatedBy: string;
  notes?: string;
}

export interface WelcomeEmailInput {
  username: string;
  email: string;
  role: string;
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



export async function sendMail(input: SendMailInput): Promise<{ id?: string; message?: string; status: number }> {
  const apiKey = process.env['MAILGUN_API_KEY'] || '';
  const domain = process.env['MAILGUN_DOMAIN'] || 'axisxd.com';
  const from = process.env['MAILGUN_FROM'] || `team.dev.ct@gmail.com`;

  if (!apiKey) {
    console.warn('[Mail] MAILGUN_API_KEY not set — skipping email send');
    return { status: 200, message: 'Skipped (no API key)' };
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
