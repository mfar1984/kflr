import nodemailer from 'nodemailer';

export async function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'indigo.herosite.pro',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // TLS
    auth: {
      user: process.env.SMTP_USER || 'enquiry@kflegacyresources.com',
      pass: process.env.SMTP_PASSWORD || 'F@iz@n!984',
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export async function sendQuotationEmail(data: {
  title: string;
  firstName: string;
  lastName: string;
  hpNumber: string;
  email: string;
  companyName: string;
  companyAddress: string;
  officeTel: string;
  officeFax: string;
  website: string;
  question: string;
  attachmentPath?: string;
  attachmentName?: string;
}) {
  const transporter = await createTransporter();

  // Email to admin
  const adminMailOptions = {
    from: `"Enquiry / Request Support KFLR" <${process.env.SMTP_FROM || 'enquiry@kflegacyresources.com'}>`,
    to: process.env.SMTP_USER || 'enquiry@kflegacyresources.com',
    subject: `New Quotation Request from ${data.firstName} ${data.lastName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #012970; border-bottom: 2px solid #4154f1; padding-bottom: 10px;">New Quotation Request</h2>
        
        <h3 style="color: #444; margin-top: 20px;">Personal Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Title:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>HP Number:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.hpNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.email}</td>
          </tr>
        </table>

        <h3 style="color: #444; margin-top: 20px;">Company Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Company Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.companyName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Address:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.companyAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Office Tel:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.officeTel}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Office Fax:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.officeFax}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Website:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.website}</td>
          </tr>
        </table>

        <h3 style="color: #444; margin-top: 20px;">Question/Request</h3>
        <div style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #4154f1; margin-top: 10px;">
          ${data.question.replace(/\n/g, '<br>')}
        </div>

        <p style="margin-top: 30px; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
          This email was sent from the KF Legacy Resources website quotation form.
        </p>
      </div>
    `,
    attachments: data.attachmentPath ? [{
      filename: data.attachmentName || 'attachment',
      path: data.attachmentPath
    }] : []
  };

  // Email to client
  const clientMailOptions = {
    from: `"Enquiry / Request Support KFLR" <${process.env.SMTP_FROM || 'enquiry@kflegacyresources.com'}>`,
    to: data.email,
    subject: 'Thank you for your Quotation Request - KF Legacy Resources',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #012970; border-bottom: 2px solid #4154f1; padding-bottom: 10px;">Thank You for Your Request</h2>
        
        <p style="font-size: 16px; color: #444; line-height: 1.6;">Dear ${data.title} ${data.firstName} ${data.lastName},</p>
        
        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          Thank you for submitting your quotation request to KF Legacy Resources. We have received your inquiry and our team will review it shortly.
        </p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #012970; margin-top: 0;">What happens next?</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Our team will review your request within 24 hours</li>
            <li>We will prepare a detailed quotation based on your requirements</li>
            <li>You will receive our response via email or phone call</li>
          </ul>
        </div>

        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          If you have any urgent questions, please feel free to contact us:
        </p>

        <table style="width: 100%; margin: 20px 0;">
          <tr>
            <td style="padding: 5px;"><strong>Email:</strong></td>
            <td style="padding: 5px;">enquiry@kflegacyresources.com</td>
          </tr>
          <tr>
            <td style="padding: 5px;"><strong>Phone:</strong></td>
            <td style="padding: 5px;">+60 3-9132 2122</td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          Best regards,<br>
          <strong>KF Legacy Resources Team</strong>
        </p>

        <p style="margin-top: 30px; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
          This is an automated confirmation email. Please do not reply to this email.
        </p>
      </div>
    `
  };

  // Send both emails
  await transporter.sendMail(adminMailOptions);
  await transporter.sendMail(clientMailOptions);
}

export async function sendSubscriptionEmails(data: { email: string }) {
  const transporter = await createTransporter();

  // Notify admin
  await transporter.sendMail({
    from: `${process.env.SMTP_FROM || 'enquiry@kflegacyresources.com'}`,
    to: process.env.SMTP_USER || 'enquiry@kflegacyresources.com',
    subject: 'New Newsletter Subscriber – KF Legacy Resources',
    text: `New subscriber: ${data.email}`,
  });

  // Thank subscriber
  const siteUrl = process.env.SITE_URL || 'https://www.kflegacyresources.com';
  const logoUrl = `${siteUrl}/assets/img/logo.png`;

  const html = `
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f9fc;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden;">
          <tr>
            <td style="background:#0d6efd;padding:18px 24px;" align="left">
              <img src="${logoUrl}" alt="KF Legacy Resources" height="32" style="display:block;border:0;outline:0;">
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px 28px;">
              <h1 style="margin:0 0 8px 0;font-size:22px;line-height:28px;color:#0b1220;">Thank you for subscribing</h1>
              <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#334155;">Hi there,</p>
              <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#334155;">You’re now subscribed to updates from <strong>KF Legacy Resources</strong>. We’ll occasionally share product updates, case studies and useful tips.</p>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:22px;color:#334155;">In the meantime, feel free to visit our website.</p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;" bgcolor="#0d6efd">
                    <a href="${siteUrl}" style="display:inline-block;padding:10px 16px;font-size:14px;color:#ffffff;text-decoration:none;border-radius:8px;">Visit Website</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 28px 28px;border-top:1px solid #eef2f7;">
              <p style="margin:0;font-size:12px;color:#64748b;">You’re receiving this email because you subscribed on our site. If this wasn’t you, simply ignore this email.</p>
              <p style="margin:8px 0 0 0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} KF Legacy Resources</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;

  await transporter.sendMail({
    from: `${process.env.SMTP_FROM || 'enquiry@kflegacyresources.com'}`,
    to: data.email,
    subject: 'Thank you for subscribing – KF Legacy Resources',
    html,
    text: `Thank you for subscribing to KF Legacy Resources. Visit ${siteUrl}`,
  });
}

