const transporter = require("../config/mailer.config");
const config = require("../config/env.config");
const welcomeTemplate = require("./templates/welcome.template");
const orderDeliveredTemplate = require("./templates/orderDelivered.template");
const resetPasswordTemplate = require("./templates/resetPassword.template");
const sendMail = require("../utils/sendMail");

const FROM = `"${config.mail.fromName}" <${config.mail.fromAddress}>`;

const emailService = {
  async sendWelcome(user) {
    if (!config.mail.user) return;
    const { subject, html } = welcomeTemplate({ name: user.name });
    await transporter.sendMail({ from: FROM, to: user.email, subject, html });
  },

  async sendOrderDelivered(user, order) {
    if (!config.mail.user) return;
    const { subject, html } = orderDeliveredTemplate({ name: user.name, order });
    await transporter.sendMail({ from: FROM, to: user.email, subject, html });
  },

  /**
   * Send password reset confirmation email
   */
  async sendPasswordReset(user, resetLink) {
    const { subject, html } = resetPasswordTemplate({ name: user.name, resetLink });
    // Use our resilient sendMail utility
    await sendMail({ to: user.email, subject, html, resetLink });
  },
};

module.exports = emailService;
