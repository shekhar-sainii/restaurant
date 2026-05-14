/**
 * Order Delivered / Visit Again Email Template
 * Sent when an order status is updated to DELIVERED or SERVED
 */
const orderDeliveredTemplate = ({ name, order }) => {
  const isDining = order.orderType === 'DINING' || order.orderType === 'DINE_IN';

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#ffffff;font-size:14px;font-weight:600;">${item.name}</td>
            <td style="color:#888;font-size:13px;text-align:center;width:60px;">x${item.qty}</td>
            <td style="color:#c9a227;font-size:14px;font-weight:700;text-align:right;width:80px;">
              ₹${(item.discountedPrice ?? item.price) * item.qty}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return {
    subject: `Thanks for dining with us, ${name}! Come back soon 🍕`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Visit Again - Pizza Kings</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#1a1a1a;border-radius:24px;overflow:hidden;border:1px solid #2a2a2a;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2a1f00 100%);padding:50px 40px;text-align:center;border-bottom:1px solid #c9a227;">
              <div style="font-size:48px;margin-bottom:16px;">🍕</div>
              <h1 style="margin:0;color:#c9a227;font-size:28px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Pizza Kings</h1>
              <p style="margin:10px 0 0;color:#ffffff;font-size:18px;font-weight:600;">Thank you, ${name}!</p>
            </td>
          </tr>

          <!-- Thank You Message -->
          <tr>
            <td style="padding:40px 40px 0;">
              <p style="margin:0 0 16px;color:#aaaaaa;font-size:15px;line-height:1.8;">
                ${isDining
                  ? `We hope you enjoyed your dining experience with us today. It was a pleasure serving you at Table #${order.tableNumber}.`
                  : `Your order has been delivered! We hope you're enjoying every bite.`
                }
              </p>
              <p style="margin:0;color:#aaaaaa;font-size:15px;line-height:1.8;">
                We'd love to see you again soon. Your next royal feast awaits! 👑
              </p>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding:30px 40px 0;">
              <div style="background:#111;border:1px solid #2a2a2a;border-radius:16px;padding:24px;">
                <h3 style="margin:0 0 4px;color:#c9a227;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;">Order Summary</h3>
                <p style="margin:0 0 20px;color:#555;font-size:12px;">Order #${order.orderNumber}</p>

                <table width="100%" cellpadding="0" cellspacing="0">
                  ${itemsHtml}
                </table>

                <!-- Totals -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                  ${order.discount > 0 ? `
                  <tr>
                    <td style="padding:6px 0;color:#888;font-size:13px;">Discount</td>
                    <td style="padding:6px 0;color:#4ade80;font-size:13px;text-align:right;">-₹${order.discount}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding:12px 0 0;color:#ffffff;font-size:15px;font-weight:800;border-top:1px solid #2a2a2a;">Total Paid</td>
                    <td style="padding:12px 0 0;color:#c9a227;font-size:20px;font-weight:800;text-align:right;border-top:1px solid #2a2a2a;">₹${order.totalAmount}</td>
                  </tr>
                </table>

                <!-- Order Meta -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;padding-top:16px;border-top:1px solid #2a2a2a;">
                  <tr>
                    <td style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Order Type</td>
                    <td style="color:#888;font-size:12px;text-align:right;">${isDining ? `Dine-In · Table ${order.tableNumber}` : 'Delivery'}</td>
                  </tr>
                  <tr>
                    <td style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding-top:8px;">Date</td>
                    <td style="color:#888;font-size:12px;text-align:right;padding-top:8px;">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Visit Again CTA -->
          <tr>
            <td style="padding:40px;">
              <div style="background:linear-gradient(135deg,rgba(201,162,39,0.1),rgba(201,162,39,0.05));border:1px solid rgba(201,162,39,0.2);border-radius:16px;padding:30px;text-align:center;">
                <p style="margin:0 0 8px;color:#c9a227;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;">Come Back Soon</p>
                <p style="margin:0 0 24px;color:#aaaaaa;font-size:14px;line-height:1.7;">
                  New pizzas, same royal quality. We're always here when the craving hits.
                </p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/menu"
                   style="display:inline-block;background:#c9a227;color:#000000;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
                  Order Again →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#111;padding:30px 40px;text-align:center;border-top:1px solid #2a2a2a;">
              <p style="margin:0 0 8px;color:#555;font-size:12px;">© ${new Date().getFullYear()} Pizza Kings. All rights reserved.</p>
              <p style="margin:0;color:#444;font-size:11px;">You received this email because you placed an order on Pizza Kings.</p>
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

module.exports = orderDeliveredTemplate;
