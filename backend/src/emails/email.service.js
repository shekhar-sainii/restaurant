const transporter = require("../config/mailer.config");
const config = require("../config/env.config");
const welcomeTemplate = require("./templates/welcome.template");
const orderDeliveredTemplate = require("./templates/orderDelivered.template");

const FROM = `"${config.mail.fromName}" <${config.mail.fromAddress}>`;

const emailService = {
  /**
   * Send welcome email on new user registration
   */
  async sendWelcome(user) {
    if (!config.mail.user) return; // skip if mail not configured
    const { subject, html } = welcomeTemplate({ name: user.name });
    await transporter.sendMail({ from: FROM, to: user.email, subject, html });
  },

  /**
   * Send order delivered / visit-again email
   */
  async sendOrderDelivered(user, order) {
    if (!config.mail.user) return;
    const { subject, html } = orderDeliveredTemplate({ name: user.name, order });
    await transporter.sendMail({ from: FROM, to: user.email, subject, html });
  },
};

module.exports = emailService;
