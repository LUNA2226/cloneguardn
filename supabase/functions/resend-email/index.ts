import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { Resend } from 'npm:resend@4.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { type, email, resetUrl, confirmationUrl } = await req.json();

    let emailData;

    if (type === 'password_reset') {
      emailData = {
        from: 'CloneGuard <noreply@cloneguard.com>',
        to: [email],
        subject: 'Reset Your Password - CloneGuard',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              .warning { background: #fef3cd; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛡️ CloneGuard</h1>
                <h2>Password Reset Request</h2>
              </div>
              <div class="content">
                <p>Hello,</p>
                
                <p>We received a request to reset your password for your CloneGuard account. If you made this request, click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset My Password</a>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Important:</strong>
                  <ul>
                    <li>This link will expire in 1 hour for security reasons</li>
                    <li>If you didn't request this password reset, please ignore this email</li>
                    <li>Your password will remain unchanged until you create a new one</li>
                  </ul>
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
                
                <p>If you have any questions or need help, please contact our support team.</p>
                
                <p>Best regards,<br>The CloneGuard Team</p>
              </div>
              <div class="footer">
                <p>This email was sent to ${email}</p>
                <p>CloneGuard - Advanced Anti-Cloning Protection</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          CloneGuard - Password Reset Request
          
          Hello,
          
          We received a request to reset your password for your CloneGuard account.
          
          If you made this request, click the link below to reset your password:
          ${resetUrl}
          
          Important:
          - This link will expire in 1 hour for security reasons
          - If you didn't request this password reset, please ignore this email
          - Your password will remain unchanged until you create a new one
          
          If you have any questions or need help, please contact our support team.
          
          Best regards,
          The CloneGuard Team
          
          This email was sent to ${email}
        `
      };
    } else if (type === 'email_confirmation') {
      emailData = {
        from: 'CloneGuard <noreply@cloneguard.com>',
        to: [email],
        subject: 'Confirm Your Email - CloneGuard',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirm Your Email</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              .features { background: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛡️ CloneGuard</h1>
                <h2>Welcome to CloneGuard!</h2>
              </div>
              <div class="content">
                <p>Hello,</p>
                
                <p>Thank you for signing up for CloneGuard! To complete your registration and start protecting your websites, please confirm your email address by clicking the button below:</p>
                
                <div style="text-align: center;">
                  <a href="${confirmationUrl}" class="button">Confirm My Email</a>
                </div>
                
                <div class="features">
                  <h3>🚀 What you can do with CloneGuard:</h3>
                  <ul>
                    <li>🔍 <strong>Real-time Clone Detection</strong> - Monitor for unauthorized copies of your websites</li>
                    <li>🛡️ <strong>Advanced Protection Scripts</strong> - Deploy obfuscated protection scripts</li>
                    <li>📊 <strong>Detailed Analytics</strong> - Track visitor behavior and clone attempts</li>
                    <li>⚡ <strong>Instant Alerts</strong> - Get notified immediately when clones are detected</li>
                    <li>🎯 <strong>Automated Actions</strong> - Redirect traffic, replace content, and more</li>
                  </ul>
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${confirmationUrl}</p>
                
                <p>If you didn't create this account, you can safely ignore this email.</p>
                
                <p>Welcome aboard!<br>The CloneGuard Team</p>
              </div>
              <div class="footer">
                <p>This email was sent to ${email}</p>
                <p>CloneGuard - Advanced Anti-Cloning Protection</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          CloneGuard - Welcome!
          
          Hello,
          
          Thank you for signing up for CloneGuard! To complete your registration and start protecting your websites, please confirm your email address by clicking the link below:
          
          ${confirmationUrl}
          
          What you can do with CloneGuard:
          - Real-time Clone Detection - Monitor for unauthorized copies of your websites
          - Advanced Protection Scripts - Deploy obfuscated protection scripts  
          - Detailed Analytics - Track visitor behavior and clone attempts
          - Instant Alerts - Get notified immediately when clones are detected
          - Automated Actions - Redirect traffic, replace content, and more
          
          If you didn't create this account, you can safely ignore this email.
          
          Welcome aboard!
          The CloneGuard Team
          
          This email was sent to ${email}
        `
      };
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid email type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Email function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});