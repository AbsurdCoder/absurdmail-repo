/**
 * Mock SMTP Service for Development
 * Replace with real SMTP integration in production
 */

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  from: EmailRecipient;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  textBody: string;
  htmlBody?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
}

export interface SendEmailResult {
  success: boolean;
  messageId: string;
  timestamp: Date;
}

/**
 * Mock email sending function
 * Logs email details to console instead of actually sending
 */
export async function sendMockEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const messageId = `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  console.log('\n📧 ========== MOCK EMAIL SENT ==========');
  console.log('From:', `${options.from.name || ''} <${options.from.email}>`);
  console.log('To:', options.to.map(r => `${r.name || ''} <${r.email}>`).join(', '));
  
  if (options.cc && options.cc.length > 0) {
    console.log('CC:', options.cc.map(r => `${r.name || ''} <${r.email}>`).join(', '));
  }
  
  if (options.bcc && options.bcc.length > 0) {
    console.log('BCC:', options.bcc.map(r => `${r.name || ''} <${r.email}>`).join(', '));
  }
  
  console.log('Subject:', options.subject);
  console.log('Message ID:', messageId);
  console.log('\n--- Text Body ---');
  console.log(options.textBody);
  
  if (options.htmlBody) {
    console.log('\n--- HTML Body ---');
    console.log(options.htmlBody.substring(0, 200) + '...');
  }
  
  if (options.attachments && options.attachments.length > 0) {
    console.log('\n--- Attachments ---');
    options.attachments.forEach(att => {
      console.log(`- ${att.filename} (${att.size} bytes) - ${att.url}`);
    });
  }
  
  console.log('========================================\n');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    success: true,
    messageId,
    timestamp: new Date(),
  };
}

/**
 * In production, replace with real SMTP service:
 * 
 * import nodemailer from 'nodemailer';
 * 
 * const transporter = nodemailer.createTransport({
 *   host: config.smtpHost,
 *   port: config.smtpPort,
 *   secure: config.smtpPort === 465,
 *   auth: {
 *     user: config.smtpUser,
 *     pass: config.smtpPass,
 *   },
 * });
 * 
 * export async function sendEmail(options: SendEmailOptions) {
 *   const info = await transporter.sendMail({
 *     from: `${options.from.name} <${options.from.email}>`,
 *     to: options.to.map(r => `${r.name} <${r.email}>`).join(', '),
 *     subject: options.subject,
 *     text: options.textBody,
 *     html: options.htmlBody,
 *     attachments: options.attachments?.map(att => ({
 *       filename: att.filename,
 *       path: att.url,
 *     })),
 *   });
 *   
 *   return {
 *     success: true,
 *     messageId: info.messageId,
 *     timestamp: new Date(),
 *   };
 * }
 */
