const TelegramBot = require("node-telegram-bot-api");
const wikipedia = require("wikipedia");
const axios = require("axios");
const express = require("express");
const keepAlive = require("./keep_alive");

// Ganti 'YOUR_BOT_TOKEN' dengan token bot Anda
const token = "6882429275:AAGR1CpOm_2MZ8CXM84foz6MHEpkwRicXAs";

// Inisialisasi bot
const bot = new TelegramBot(token, { polling: true });
const app = express();

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
    }
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
        opts
      );
    } catch (error) {
      bot.sendMessage(chatId, "Tidak dapat menemukan hasil pada Wikipedia.");
    }
  }

  // Jika pesan berisi perintah /adzan
  if (messageText.startsWith("/adzan")) {
    const query = messageText.substring(7).trim(); // Menghapus '/adzan ' dari awal pesan
    try {
      // Mendapatkan data adzan berdasarkan nama kota
      const response = await axios.get(
        `http://api.aladhan.com/v1/timingsByCity?city=${query}&country=Indonesia`
      );
      const data = response.data.data;

      // Memformat pesan dengan data adzan untuk lokasi tertentu
      const timings = data.timings;
      const adzanMessage = `Jadwal Adzan untuk ${query}:\n\nSubuh: ${timings.Fajr}\nDzuhur: ${timings.Dhuhr}\nAshar: ${timings.Asr}\nMaghrib: ${timings.Maghrib}\nIsya: ${timings.Isha}`;

      bot.sendMessage(chatId, adzanMessage);
    } catch (error) {
      bot.sendMessage(
        chatId,
        "Maaf, tidak dapat menemukan jadwal Adzan untuk lokasi yang dimaksud."
      );
    }
  }

  // Jika pesan berisi perintah /berita
  if (messageText.startsWith("/berita")) {
    try {
      // Mendapatkan berita trending dari News API
      const response = await axios.get(
        "https://newsapi.org/v2/top-headlines?country=id&apiKey=87f7fbf6bb5c4811bef41da70e59bec0"
      );
      const articles = response.data.articles;

      // Mengirim 5 berita teratas ke pengguna
      for (let i = 0; i < 5; i++) {
        const article = articles[i];
        const message = `${i + 1}. ${article.title}\n${article.url}`;
        bot.sendMessage(chatId, message);
      }
    } catch (error) {
      bot.sendMessage(chatId, "Maaf, tidak dapat menemukan berita trending.");
    }
  }

  if (messageText.startsWith('/lagu ')) {
    const query = messageText.substring(6).trim(); // Menghapus '/lagu ' dari awal pesan
    const [artist, title] = query.split('/'); // Memisahkan nama artis dan judul lagu

    try {
        // Melakukan pencarian lirik lagu menggunakan Lyrics.ovh API
        const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
        const lyrics = response.data.lyrics;

        if (lyrics) {
            bot.sendMessage(chatId, `Lirik lagu untuk "${query}":\n\n${lyrics}`);
        } else {
            bot.sendMessage(chatId, `Maaf, lirik lagu untuk "${query}" tidak ditemukan.`);
        }
    } catch (error) {
        // Jika terjadi kesalahan, kirim pesan error yang lebih deskriptif
        console.error('Error:', error.message);
        bot.sendMessage(chatId, 'Maaf, terjadi kesalahan dalam mencari lirik lagu. Mohon coba lagi nanti.');
    }
}

  // Jika pesan berisi perintah /start
  if (messageText === "/start") {
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
  }
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

bot.onText(/\/id/, (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  let message = `🆔 <b>User ID:</b> ${user.id}\n`;
  message += user.username ? `👤 <b>Username:</b> @${user.username}\n` : '';
  message += `📛 <b>Name:</b> ${user.first_name} ${user.last_name ? user.last_name : ""}\n`;
  message += `🌐 <b>Language:</b> ${user.language_code ? user.language_code : "Not specified"}`;

  bot.sendMessage(chatId, message, { parse_mode: "HTML" });
});

// Start the bot
bot.on("polling_error", (error) => {
  console.log(error); // => 'EFATAL'
});