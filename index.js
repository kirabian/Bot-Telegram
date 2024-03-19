const TelegramBot = require('node-telegram-bot-api');
const wikipedia = require('wikipedia');

// Ganti 'YOUR_BOT_TOKEN' dengan token bot Anda
const token = '6882429275:AAGR1CpOm_2MZ8CXM84foz6MHEpkwRicXAs';

// Inisialisasi bot
const bot = new TelegramBot(token, { polling: true });

// Tentukan Bahasa Indonesia sebagai bahasa yang akan digunakan
wikipedia.setLang('id');

// Tanggapi pesan yang diterima
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Jika pesan berisi perintah /wiki
  if (messageText.startsWith('/wiki ')) {
    const query = messageText.substring(6); // Menghapus '/wiki ' dari awal pesan
    try {
      // Melakukan pencarian di Wikipedia Bahasa Indonesia
      const page = await wikipedia.page(query);
      const summary = await page.summary();
      bot.sendMessage(chatId, `Wikipedia hasil untuk "${query}":\n${summary.extract}`);
    } catch (error) {
      bot.sendMessage(chatId, 'Tidak dapat menemukan hasil pada Wikipedia.');
    }
  } else {
    // Balas pesan dengan pesan yang sama
    bot.sendMessage(chatId, `Anda mengirim: ${messageText}`);
  }
});

// Tanggapi perintah /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Keyboard dengan link
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Link 1', url: 'http://example.com/1' }],
        [{ text: 'Link 2', url: 'http://example.com/2' }],
        [{ text: 'Link 3', url: 'http://example.com/3' }],
        [{ text: 'Link 4', url: 'http://example.com/4' }]
      ]
    }
  };

  // Pesan sambutan
  const welcomeMessage = `Halo! Saya adalah bot sederhana yang dapat membantu Anda mencari informasi di Wikipedia Bahasa Indonesia. Gunakan perintah /wiki diikuti dengan kata kunci pencarian untuk memulai. Selamat mencoba!`;

  bot.sendMessage(chatId, welcomeMessage, opts).then(() => {
    bot.sendMessage(chatId, 'Bot ini dibuat oleh Kira.');
  });
});

// Tanggapi perintah /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Anda dapat mengirim pesan kepada saya atau gunakan perintah /wiki untuk mencari di Wikipedia Bahasa Indonesia.');
});
