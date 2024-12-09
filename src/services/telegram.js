import TelegramBot from "node-telegram-bot-api";

class TelegramService {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: false,
    });
    this.adminId = process.env.TELEGRAM_ADMIN_ID;
  }

  async sendMessage(message) {
    try {
      await this.bot.sendMessage(this.adminId, message, { parse_mode: "HTML" });
    } catch (error) {
      console.error("Error sending Telegram message:", error);
    }
  }

  async notifyBackupSuccess(dbName, size) {
    const message =
      `✅ <b>Backup Successful</b>\n\n` +
      `Database: <code>${dbName}</code>\n` +
      `Size: <code>${size}</code>\n` +
      `Time: <code>${new Date().toISOString()}</code>`;

    await this.sendMessage(message);
  }

  async notifyBackupError(dbName, error) {
    const message =
      `❌ <b>Backup Failed</b>\n\n` +
      `Database: <code>${dbName}</code>\n` +
      `Error: <code>${error.message}</code>\n` +
      `Time: <code>${new Date().toISOString()}</code>`;

    await this.sendMessage(message);
  }
}

export const telegramService = new TelegramService();
