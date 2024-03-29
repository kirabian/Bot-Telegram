const TelegramBot = require("node-telegram-bot-api");
const wikipedia = require("wikipedia");
const axios = require("axios");


// Ganti 'YOUR_BOT_TOKEN' dengan token bot Anda
const token = "6882429275:AAGR1CpOm_2MZ8CXM84foz6MHEpkwRicXAs";

// Inisialisasi bot
const bot = new TelegramBot(token, { polling: true });

// Tentukan Bahasa Indonesia sebagai bahasa yang akan digunakan
wikipedia.setLang("id");

// Fungsi untuk mengirim pesan bergabung ke channel
function sendJoinMessage(chatId) {
  bot.sendMessage(
    chatId,
    "Silakan bergabung dengan channel kami untuk menggunakan bot ini: @testercodingan",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Join Channel", url: "https://t.me/testercodingan" }],
        ],
      },
    },
  );
}

// Daftar pertanyaan untuk "truth or dare"
const truthQuestions = [
  "Apa hal paling konyol yang pernah kamu lakukan?",
  "Siapa orang yang paling kamu benci?",
  "Apakah kamu pernah berbohong kepada seseorang di grup ini?",
  "Apa hal teraneh yang pernah kamu lakukan?",
  "Kapan kali terakhir kamu melakukan sesuatu yang kamu sebut sebagai kebodohan?",
  "Apa yang menjadi rahasia terdalam yang pernah kamu simpan?",
  "Apakah kamu pernah menyembunyikan sesuatu dari teman-temanmu? Apa itu?",
  "Adakah hal yang ingin kamu ubah dari masa lalu kamu?",
  "Apa hal yang paling mengejutkan yang pernah kamu temui?",
  "Apakah ada kebohongan kecil yang pernah kamu katakan kepada seseorang yang tidak pernah mereka ketahui?",
  "Apa hal yang paling membuatmu takut saat ini?",
  "Apakah kamu pernah memalsukan alasan untuk menghindari sesuatu?",
  "Apa kebiasaan buruk yang ingin kamu tinggalkan tetapi sulit untuk dilakukan?",
  // Tambahkan pertanyaan ke dalam array ini
];

const dareChallenges = [
  "Kirim pesan ke seseorang di kontak kamu dan bilang 'Aku mencintaimu'.",
  "Nyanyikan lagu 'Twinkle, Twinkle, Little Star' di grup ini.",
  "Kirim emoji lucu ke seseorang di grup ini dan katakan 'Aku mengingatimu saat melihat emoji ini'.",
  "Lakukan tarian lucu di tengah ruangan.",
  "Kirim pesan teks ke seseorang yang kamu kenal dengan pesanya <i>suka makan tahu busuk, apakah kamu mau makan bersamaku?</i>",
  "Lakukan imitasi terbaikmu dari selebriti favoritmu.",
  "Ambil selfie dengan ekspresi wajah yang paling konyol dan bagikan ke media sosial.",
  "Lakukan panggilan telepon ke orang tua atau saudara kamu dan katakan <i>Saya sangat mencintai broccoli dan ingin makan itu setiap hari!</i> kemudian tutup telepon tanpa penjelasan lebih lanjut.",
  "Pilih satu lagu favoritmu dan nyanyikan dengan volume paling keras yang kamu bisa.",
  "Ambil foto dengan pose supermodel yang dramatis dan bagikan ke story media sosialmu.",
  "Buat puisi lucu tentang objek di sekitarmu dan bacakan untuk semua yang hadir.",
  "Coba makan makanan pedas sebanyak yang kamu bisa tanpa minum air selama satu menit.",
  "Ambil sebuah benda di sekitarmu dan buatlah cerita pendek tentang kehidupan benda tersebut.",
  // Tambahkan tantangan ke dalam array ini
];

// Tanggapi perintah /truth atau /dare
bot.onText(/\/(truth|dare)/, (msg, match) => {
  const chatId = msg.chat.id;
  const command = match[1]; // Mendapatkan perintah (truth atau dare)

  let message;
  if (command === "truth") {
    // Pilih pertanyaan secara acak dari array truthQuestions
    const randomIndex = Math.floor(Math.random() * truthQuestions.length);
    message = `Truth: ${truthQuestions[randomIndex]}`;
  } else if (command === "dare") {
    // Pilih tantangan secara acak dari array dareChallenges
    const randomIndex = Math.floor(Math.random() * dareChallenges.length);
    message = `Dare: ${dareChallenges[randomIndex]}`;
  }

  bot.sendMessage(chatId, message);
});

// Tanggapi pesan yang diterima
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  const messagePhoto = msg.photo; // Ambil data foto jika pesan berisi foto

  // Tanggapi jika pesan adalah gambar
  if (messagePhoto && messagePhoto.length > 0) {
    // Cek apakah pengguna membalas pesan gambar dengan perintah "tosticker"
    if (messageText === "/tosticker" && msg.reply_to_message) {
      // Ambil ID foto yang di-reply oleh pengguna
      const photoId = msg.reply_to_message.photo[0].file_id;

      try {
        // Konversi foto menjadi stiker menggunakan method createStickerFromWebp
        const sticker = await bot.createStickerFromWebp(
          chatId,
          photoId,
          {
            emojis: "👍", // Atur emoji untuk stiker yang dihasilkan
          }
        );

        // Kirim stiker yang dihasilkan kembali kepada pengguna
        bot.sendSticker(chatId, sticker.sticker.file_id);
      } catch (error) {
        console.error("Error:", error.message);
        bot.sendMessage(chatId, "Maaf, terjadi kesalahan dalam mengonversi gambar menjadi stiker.");
      }
    }
  }

  // Jika pesan berisi perintah /wiki
  if (messageText.startsWith("/wiki ")) {
    const query = messageText.substring(6); // Menghapus '/wiki ' dari awal pesan
    try {
      // Melakukan pencarian di Wikipedia Bahasa Indonesia
      const page = await wikipedia.page(query);
      const summary = await page.summary();
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Baca lebih lanjut tentang ${query}`, url: page.fullurl }],
          ],
        },
      };
      bot.sendMessage(
        chatId,
        `Wikipedia hasil untuk "${query}":\n${summary.extract}`,
        opts,
      );
    } catch (error) {
      bot.sendMessage(chatId, "Tidak dapat menemukan hasil pada Wikipedia.");
    }
  }

  // Kode lainnya di sini...
});

// Tanggapi perintah /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
  Welcome To My Bot!

  This Is Command Bot:
  📚 /wiki - Search on Wikipedia.
  📰 /berita - Get top news headlines.
  💬 /truth - Get a truth question.
  🎯 /dare - Get a dare challenge.
  🕌 /adzan - Get prayer times.
  `;
  bot.sendMessage(chatId, helpMessage);
});

// Tanggapi perintah /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  // Periksa apakah pengguna telah bergabung dengan channel
  const isJoined = await bot
    .getChatMember("@testercodingan", msg.from.id)
    .then((member) => {
      return member.status !== "left" && member.status !== "kicked";
    })
    .catch((err) => {
      console.error("Error:", err.message);
      return false;
    });

  if (isJoined) {
    // Jika pengguna sudah bergabung, kirim pesan selamat menggunakan
    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Owner", url: "http://t.me/mgelissa" },
            { text: "Donation", url: "http://example.com/2" },
          ],
        ],
      },
    };
    const welcomeMessage = `Halo! Selamat datang kembali. Silakan gunakan perintah /help untuk melihat isi command yang tersedia.`;
    bot.sendMessage(chatId, welcomeMessage, opts);
  } else {
    // Jika pengguna belum bergabung, kirim pesan untuk bergabung ke channel
    sendJoinMessage(chatId);
  }
});

// Start the bot
bot.on("polling_error", (error) => {
  console.log(error); // => 'EFATAL'
});