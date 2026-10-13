import nodemailer from 'nodemailer';

export type StatusEmailType = 'REVIEWED' | 'ACCEPTED' | 'REJECTED';

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

const getEmailTemplate = (
  candidateName: string,
  jobTitle: string,
  company: string,
  status: StatusEmailType
): EmailTemplate => {
  let subject = '';
  let headline = '';
  let message = '';
  let statusBadgeColor = '#3b82f6'; // default blue
  let statusBadgeText = 'Under Review';

  switch (status) {
    case 'REVIEWED':
      subject = `Application Update: Under Review - ${jobTitle} at ${company}`;
      headline = 'Application Under Review';
      statusBadgeColor = '#2563eb';
      statusBadgeText = 'Under Review';
      message = `Hi ${candidateName}, Great news! ${company} has reviewed your application for the ${jobTitle} role.`;
      break;

    case 'ACCEPTED':
      subject = `Congratulations! Application Accepted - ${jobTitle} at ${company}`;
      headline = 'Application Accepted!';
      statusBadgeColor = '#059669';
      statusBadgeText = 'Accepted / Shortlisted';
      message = `Hi ${candidateName}, Congratulations! ${company} has accepted your application for the ${jobTitle} role. Their hiring team will reach out with interview details soon.`;
      break;

    case 'REJECTED':
      subject = `Application Update: ${jobTitle} at ${company}`;
      headline = 'Application Update';
      statusBadgeColor = '#64748b';
      statusBadgeText = 'Application Concluded';
      message = `Hi ${candidateName}, Thank you for your interest in the ${jobTitle} position. ${company} has decided to proceed with other applicants for this role.`;
      break;
  }

  const plainText = `${message}\n\nPosition: ${jobTitle}\nCompany: ${company}\nStatus: ${statusBadgeText}\n\nOfficial Dispatch Mailbox: chirehub@gmail.com\nThis is an automated notification from HireHub Careers. You can verify this sender address in your HireHub candidate dashboard at any time.\n\nBest regards,\nThe HireHub Team\nhttps://hirehub.io`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 24px;
      color: #1e293b;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      text-decoration: none;
    }
    .logo span {
      color: #4f46e5;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
      background-color: ${statusBadgeColor};
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #334155;
      margin: 0 0 20px 0;
    }
    .job-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .job-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .job-company {
      font-size: 14px;
      font-weight: 600;
      color: #4f46e5;
    }
    .verification-box {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 24px 0 16px 0;
    }
    .verification-text {
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }
    .verification-text code {
      font-family: monospace;
      color: #4f46e5;
      background-color: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Hire<span>Hub</span></div>
    </div>
    
    <div class="badge">${statusBadgeText}</div>
    <h1>${headline}</h1>
    
    <p>${message}</p>
    
    <div class="job-card">
      <div class="job-title">${jobTitle}</div>
      <div class="job-company">${company}</div>
    </div>
    
    <p style="font-size: 14px; color: #64748b;">
      You can track the progress of all your active applications at any time from your HireHub candidate dashboard.
    </p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
      This is an automated notification from <strong>HireHub Careers</strong> dispatched via our official system mailbox <code>chirehub@gmail.com</code>.<br/>
      You can verify this sender address in your HireHub candidate dashboard at any time.
    </p>
    
    <div class="footer">
      &copy; ${new Date().getFullYear()} HireHub Platform. All rights reserved.<br>
      Official System Dispatch: chirehub@gmail.com
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    subject,
    text: plainText,
    html,
  };
};

/**
 * Sends an automated status update email to a candidate when their application
 * status changes to REVIEWED, ACCEPTED, or REJECTED.
 *
 * In production: Uses Gmail SMTP via EMAIL_USER and EMAIL_PASS.
 * In development: Logs formatted dispatch info without throwing, ensuring zero runtime interruptions.
 */
export const sendApplicationStatusEmail = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string,
  company: string,
  status: StatusEmailType
): Promise<void> => {
  const { subject, text, html } = getEmailTemplate(
    candidateName,
    jobTitle,
    company,
    status
  );

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Development / fallback mode when credentials are not configured
  if (!emailUser || !emailPass) {
    const senderAddress = emailUser || 'chirehub@gmail.com';
    console.log(
      `[DEV EMAIL DISPATCHED] From: HireHub Notifications <${senderAddress}> | To: <${candidateEmail}> | Subject: <${subject}> | Status: <${status}>`
    );
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    await transporter.sendMail({
      from: `"HireHub Notifications" <${emailUser || 'chirehub@gmail.com'}>`,
      to: candidateEmail,
      subject,
      text,
      html,
    });

    console.log(
      `[EMAIL SENT] To: <${candidateEmail}> | Subject: <${subject}> | Status: <${status}>`
    );
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to <${candidateEmail}>:`, error);
    // Graceful resolution - never throw or break request flow
  }
};

/**
 * Dispatches an inbound support inquiry submitted from the platform to the official support mailbox.
 */
export const sendSupportInquiryEmail = async (
  senderEmail: string,
  subject: string,
  message: string
): Promise<void> => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const recipientEmail = emailUser || 'chirehub@gmail.com';
  const mailSubject = `[HireHub Support Inquiry] ${subject.trim()}`;

  const plainText = `New Support Inquiry from HireHub\n\nFrom: ${senderEmail}\nSubject: ${subject}\nReceived At: ${new Date().toUTCString()}\n\nMessage:\n${message}\n\n---\nDispatched from HireHub Support Channel`;

  const safeMessageHtml = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br/>');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${mailSubject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      padding: 24px;
      margin: 0;
      color: #1e293b;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      padding-bottom: 16px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .logo span {
      color: #4f46e5;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      color: #4f46e5;
      background-color: #eef2ff;
      border: 1px solid #e0e7ff;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .field {
      margin-bottom: 14px;
    }
    .field-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 3px;
      letter-spacing: 0.5px;
    }
    .field-value {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }
    .field-value a {
      color: #4f46e5;
      text-decoration: none;
    }
    .field-value a:hover {
      text-decoration: underline;
    }
    .message-section {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }
    .message-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      margin-top: 8px;
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
    }
    .footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
      margin-top: 24px;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Hire<span>Hub</span> Support Dispatch</div>
    </div>
    <div class="badge">INBOUND USER INQUIRY</div>

    <div class="field">
      <div class="field-label">SENDER EMAIL</div>
      <div class="field-value">
        <a href="mailto:${senderEmail}">${senderEmail}</a>
      </div>
    </div>

    <div class="field">
      <div class="field-label">SUBJECT</div>
      <div class="field-value">
        <strong>${subject.trim()}</strong>
      </div>
    </div>

    <div class="field">
      <div class="field-label">RECEIVED AT</div>
      <div class="field-value">
        ${new Date().toUTCString()}
      </div>
    </div>

    <div class="message-section">
      <div class="field-label">MESSAGE</div>
      <div class="message-box">${safeMessageHtml}</div>
    </div>

    <div class="footer">
      Reply directly to this email to respond to <strong>${senderEmail}</strong>.<br/>
      Dispatched via HireHub Platform Support Channel.
    </div>
  </div>
</body>
</html>
  `.trim();

  // Development / fallback mode when credentials are not configured
  if (!emailUser || !emailPass) {
    console.log(
      `[DEV SUPPORT EMAIL DISPATCHED] From: <${senderEmail}> | To: <${recipientEmail}> | Subject: <${mailSubject}>`
    );
    console.log(`[DEV SUPPORT MESSAGE] ${message}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    await transporter.sendMail({
      from: `"HireHub Support" <${emailUser}>`,
      to: recipientEmail,
      replyTo: senderEmail,
      subject: mailSubject,
      text: plainText,
      html,
    });

    console.log(
      `[SUPPORT EMAIL SENT] From: <${senderEmail}> | To: <${recipientEmail}> | Subject: <${mailSubject}>`
    );
  } catch (error) {
    console.error(`[SUPPORT EMAIL ERROR] Failed to send support email:`, error);
    throw error;
  }
};


