const resetPasswordTemplate = ({ name, resetLink }) => {
  return {
    subject: "Reset Your Account Password - Platform Security",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
    .container { max-w-xl mx-auto p-8 background-color: #111111; border: 1px solid #222222; border-radius: 24px; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.8); }
    .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #222222; }
    .logo { font-size: 24px; font-weight: 900; color: #c9a227; letter-spacing: 2px; text-transform: uppercase; }
    .content { padding-top: 32px; padding-bottom: 32px; line-height: 1.6; color: #dddddd; }
    .title { font-size: 20px; font-weight: bold; color: #ffffff; margin-bottom: 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #c9a227, #d4af37); color: #000000 !important; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin-top: 24px; margin-bottom: 24px; box-shadow: 0 8px 20px rgba(201,162,39,0.3); }
    .footer { text-align: center; font-size: 11px; color: #666666; border-top: 1px solid #222222; padding-top: 24px; }
  </style>
</head>
<body>
  <div style="padding: 20px;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #121212; border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px;">
      <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <span style="font-size: 22px; font-weight: 900; color: #c9a227; letter-spacing: 3px; text-transform: uppercase;">GOURMET SUITE</span>
      </div>
      <div style="padding-top: 32px; color: #dddddd; font-size: 15px; line-height: 1.7;">
        <p style="font-size: 18px; font-weight: bold; color: #ffffff;">Hello ${name || 'Valued User'},</p>
        <p>We received a request to reset the password associated with your account. If you initiated this request, please click the secure confirmation button below to proceed.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="display: inline-block; background-color: #c9a227; color: #000000; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; font-size: 13px; padding: 16px 36px; border-radius: 14px; text-decoration: none;">Reset Secure Password</a>
        </div>
        
        <p style="font-size: 13px; color: #888888;">If the button does not work, copy and paste the following link directly into your web browser:</p>
        <p style="font-size: 11px; word-break: break-all; color: #c9a227; background-color: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px;">${resetLink}</p>
        
        <p style="font-size: 12px; color: #666666; margin-top: 32px;">If you did not request a password reset, you can safely ignore this email. Your credentials will remain securely unchanged.</p>
      </div>
      <div style="text-align: center; font-size: 11px; color: #555555; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; margin-top: 24px;">
        © Platform Operations. Secured with military-grade transport encryption.
      </div>
    </div>
  </div>
</body>
</html>
    `,
  };
};

module.exports = resetPasswordTemplate;
