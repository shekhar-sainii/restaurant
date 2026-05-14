/**
 * Welcome Email Template
 * Sent when a new user registers on Pizza Kings
 */
const welcomeTemplate = ({ name }) => {
  return {
    subject: `Welcome to Pizza Kings, ${name}! 🍕`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Pizza Kings</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#1a1a1a;border-radius:24px;overflow:hidden;border:1px solid #2a2a2a;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2a1f00 100%);padding:50px 40px;text-align:center;border-bottom:1px solid #c9a227;">
              <div style="display:inline-block;background:rgba(201,162,39,0.15);border:1px solid rgba(201,162,39,0.3);border-radius:50%;width:80px;height:80px;line-height:80px;font-size:36px;margin-bottom:20px;">🍕</div>
              <h1 style="margin:0;color:#c9a227;font-size:32px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Pizza Kings</h1>
              <p style="margin:8px 0 0;color:#888;font-size:11px;letter-spacing:4px;text-transform:uppercase;">Culinary Excellence Redefined</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:50px 40px;">
              <h2 style="margin:0 0 16px;color:#ffffff;font-size:26px;font-weight:700;">Welcome, ${name}! 👑</h2>
              <p style="margin:0 0 24px;color:#aaaaaa;font-size:15px;line-height:1.8;">
                We're thrilled to have you join the Pizza Kings family. Your account is all set and you're ready to experience the finest pizzas crafted with authentic Italian recipes and premium ingredients.
              </p>

              <!-- Highlights -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                <tr>
                  <td style="padding:0 8px 16px 0;width:50%;vertical-align:top;">
                    <div style="background:#222;border:1px solid #2a2a2a;border-radius:16px;padding:20px;text-align:center;">
                      <div style="font-size:28px;margin-bottom:10px;">🔥</div>
                      <p style="margin:0;color:#c9a227;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Wood-Fired</p>
                      <p style="margin:6px 0 0;color:#888;font-size:12px;">Authentic oven-baked perfection</p>
                    </div>
                  </td>
                  <td style="padding:0 0 16px 8px;width:50%;vertical-align:top;">
                    <div style="background:#222;border:1px solid #2a2a2a;border-radius:16px;padding:20px;text-align:center;">
                      <div style="font-size:28px;margin-bottom:10px;">⚡</div>
                      <p style="margin:0;color:#c9a227;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Fast Delivery</p>
                      <p style="margin:6px 0 0;color:#888;font-size:12px;">Hot & fresh to your door</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 8px 0 0;width:50%;vertical-align:top;">
                    <div style="background:#222;border:1px solid #2a2a2a;border-radius:16px;padding:20px;text-align:center;">
                      <div style="font-size:28px;margin-bottom:10px;">🌿</div>
                      <p style="margin:0;color:#c9a227;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Fresh Daily</p>
                      <p style="margin:6px 0 0;color:#888;font-size:12px;">Dough made fresh every morning</p>
                    </div>
                  </td>
                  <td style="padding:0 0 0 8px;width:50%;vertical-align:top;">
                    <div style="background:#222;border:1px solid #2a2a2a;border-radius:16px;padding:20px;text-align:center;">
                      <div style="font-size:28px;margin-bottom:10px;">👑</div>
                      <p style="margin:0;color:#c9a227;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Royal Quality</p>
                      <p style="margin:6px 0 0;color:#888;font-size:12px;">Premium ingredients always</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <div style="text-align:center;margin:40px 0 10px;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/menu"
                   style="display:inline-block;background:#c9a227;color:#000000;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
                  Explore Our Menu →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#111;padding:30px 40px;text-align:center;border-top:1px solid #2a2a2a;">
              <p style="margin:0 0 8px;color:#555;font-size:12px;">© ${new Date().getFullYear()} Pizza Kings. All rights reserved.</p>
              <p style="margin:0;color:#444;font-size:11px;">You received this email because you registered on Pizza Kings.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
};

module.exports = welcomeTemplate;
