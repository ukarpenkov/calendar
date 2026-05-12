import type { TranslationKey } from './en';

export const idTranslations = {
  'common.appName': 'Kalender',
  'common.hoursUnit': 'j',
  'common.backToYear': 'Kembali ke tahun',
  'common.navigateBack': 'Kembali',
  'common.cancel': 'Batal',
  'app.error.bootstrapTitle': 'Gagal menginisialisasi data kalender lokal.',
  'app.error.bootstrapSubtitle':
    'Periksa penyimpanan perangkat, lalu coba lagi. Anda juga dapat membuka ulang aplikasi.',
  'app.error.bootstrapRetry': 'Coba lagi',
  'app.error.monthTitle': 'Gagal membuka bulan yang dipilih.',
  'app.error.monthSubtitle': 'Kembali ke ringkasan tahun dan coba lagi.',
  'splash.loadingTitle': 'Memuat tampilan tahun luring',
  'splash.loadingSubtitle': 'Menginisialisasi data kalender lokal...',
  'year.menu.settings': 'Pengaturan',
  'year.home.title': 'Tahun {{year}}',
  'year.summary.work': 'Kerja',
  'year.summary.off': 'Libur',
  'year.summary.days': 'Hari',
  'month.selectedDay.eyebrow': 'Hari terpilih',
  'month.totals.totalDays': 'Total hari',
  'month.totals.workingDays': 'Hari kerja',
  'month.totals.nonWorkingDays': 'Hari libur',
  'month.totals.workHours': 'Jam kerja',
  'month.nav.previousMonth': 'Bulan sebelumnya',
  'month.nav.nextMonth': 'Bulan berikutnya',
  'settings.title': 'Pengaturan',
  'settings.sections.calendarData.title': 'Data kalender',
  'settings.sections.calendarData.subtitle':
    'Tahun aktif saat ini dan langkah impor mendatang.',
  'settings.rows.activeYear.title': 'Tahun aktif',
  'settings.rows.activeYear.subtitle':
    'Kumpulan data SQLite yang sedang dimuat di aplikasi adalah {{year}}.',
  'settings.rows.importYear.title': 'Impor tahun (JSON)',
  'settings.rows.importYear.subtitle':
    'Membuka layar khusus untuk alur penggantian tahun melalui JSON lokal.',
  'settings.rows.importYear.action': 'Buka',
  'settings.rows.bundledCalendar.title': 'Kalender produksi (2026)',
  'settings.rows.bundledCalendar.subtitle': 'Dataset bawaan: {{region}}.',
  'settings.bundledCalendar.chip.ru': 'Rusia',
  'settings.bundledCalendar.chip.tr': 'Türkiye',
  'settings.bundledCalendar.chip.id': 'Indonesia',
  'settings.bundledCalendar.chip.ja': 'Jepang',
  'settings.sections.appearance.title': 'Tampilan',
  'settings.sections.appearance.subtitle':
    'Pengaturan tema dikontrol melalui konteks aplikasi global.',
  'settings.rows.darkTheme.title': 'Tema gelap',
  'settings.rows.darkTheme.subtitle': 'Mode saat ini: {{mode}}.',
  'settings.sections.localization.title': 'Bahasa',
  'settings.sections.localization.subtitle':
    'Mengganti bahasa antarmuka di seluruh aplikasi.',
  'settings.rows.language.title': 'Bahasa antarmuka',
  'settings.rows.language.subtitle': 'Bahasa saat ini: {{language}}.',
  'settings.rows.language.userImportHint':
    'Kalender dari impor JSON: mengganti bahasa antarmuka tidak mengganti data. Untuk kalender bawaan gunakan bagian «Kalender produksi (2026)» di bawah.',
  'settings.languageSwitch.userJsonCalendar': 'Kalender JSON',
  'settings.sections.about.title': 'Tentang',
  'settings.sections.about.subtitle':
    'Informasi layanan untuk build lokal-utama ini.',
  'settings.about.app': 'Aplikasi',
  'settings.about.version': 'Versi',
  'settings.about.storage': 'Penyimpanan',
  'settings.about.defaultDataset': 'Dataset default',
  'settings.about.theme': 'Tema',
  'settings.about.language': 'Bahasa',
  'settings.about.telegram': 'Telegram',
  'settings.about.appValue': 'Kalender',
  'settings.about.storageValue': 'SQLite luring',
  'settings.about.defaultDatasetValue': 'Kalender produksi 2026',
  'year.reminder.title': 'Template JSON tahun berikutnya',
  'year.reminder.body':
    'Template {{year}} akan dipublikasikan di Telegram. Buka saluran untuk mengunduh JSON baru ketika sudah tersedia.',
  'year.reminder.action': 'Buka Telegram',
  'importEntry.title': 'Impor JSON',
  'importEntry.eyebrow': 'Masuk alur impor',
  'importEntry.heroTitle': 'Siapkan penggantian tahun dari JSON lokal',
  'importEntry.heroSubtitle':
    'Layar ini menjadi titik masuk khusus untuk mengganti tahun aktif dengan berkas JSON lokal.',
  'importEntry.currentYear.title': 'Tahun aktif saat ini',
  'importEntry.currentYear.subtitle':
    'Jika Anda mengonfirmasi langkah berikutnya, dataset SQLite untuk {{year}} akan diganti, bukan digabung.',
  'importEntry.fileCard.title': 'Berkas JSON terpilih',
  'importEntry.fileCard.idleSubtitle':
    'Pilih berkas JSON lokal untuk memulai validasi. Tahun aktif tidak berubah sampai penggantian dikonfirmasi.',
  'importEntry.fileCard.readySubtitle':
    'Berkas terpilih lolos validasi dan siap mengganti dataset SQLite aktif.',
  'importEntry.fileCard.fileName': 'Berkas',
  'importEntry.fileCard.detectedYear': 'Tahun terdeteksi',
  'importEntry.fileCard.fileSize': 'Ukuran',
  'importEntry.preview.title': 'Pratinjau impor tervalidasi',
  'importEntry.preview.subtitle':
    'Tahun {{year}} lolos validasi dan sekarang dapat mengganti dataset lokal saat ini.',
  'importEntry.preview.totalDays': 'Total hari',
  'importEntry.preview.workingDays': 'Hari kerja',
  'importEntry.preview.nonWorkingDays': 'Hari non-kerja',
  'importEntry.preview.workHours': 'Jam kerja',
  'importEntry.actions.chooseFile': 'Pilih berkas JSON',
  'importEntry.actions.chooseAnotherFile': 'Pilih berkas lain',
  'importEntry.actions.validating': 'Memvalidasi berkas...',
  'importEntry.actions.replaceYear': 'Ganti tahun aktif',
  'importEntry.actions.importing': 'Mengganti dataset lokal...',
  'importEntry.confirm.title': 'Ganti tahun kalender aktif?',
  'importEntry.confirm.body':
    'Tahun saat ini {{currentYear}} akan sepenuhnya diganti oleh tahun {{importedYear}} di penyimpanan SQLite lokal. Tidak ada penggabungan data.',
  'importEntry.confirm.action': 'Ganti tahun',
  'importEntry.error.validationTitle': 'Validasi gagal',
  'importEntry.error.validationBody':
    'Berkas JSON terpilih tidak lolos validasi. Tahun kalender aktif tidak berubah.',
  'importEntry.error.unsupportedTitle': 'Berkas tidak didukung',
  'importEntry.error.unsupportedBody':
    'Pilih berkas `.json` dengan struktur impor kalender.',
  'importEntry.error.readTitle': 'Gagal membaca berkas',
  'importEntry.error.readBody':
    'Berkas terpilih tidak dapat dibaca dari penyimpanan perangkat. Tahun kalender aktif tidak berubah.',
  'importEntry.error.pickerTitle': 'Gagal membuka pemilih berkas',
  'importEntry.error.pickerBody':
    'Pemilih berkas sistem tidak mengembalikan berkas JSON yang dapat dibaca.',
  'importEntry.error.replaceTitle': 'Gagal mengganti tahun aktif',
  'importEntry.error.replaceBody':
    'Validasi berhasil, tetapi tahun baru tidak dapat ditulis ke SQLite. Kalender saat ini tetap aktif.',
  'importEntry.error.replaceDetail':
    'Periksa ketersediaan penyimpanan lokal dan coba impor lagi.',
  'importEntry.error.genericTitle': 'Impor gagal',
  'importEntry.error.genericBody':
    'Alur impor berhenti sebelum mengganti tahun kalender aktif.',
  'importEntry.error.genericDetail':
    'Tinjau berkas terpilih dan coba lagi.',
  'importEntry.flow.title': 'Cara kerja impor ini',
  'importEntry.flow.step1': '1. Pilih berkas JSON lokal dari perangkat.',
  'importEntry.flow.step2':
    '2. Validasi dan normalisasi tahun terpilih sebelum penulisan apa pun.',
  'importEntry.flow.step3':
    '3. Minta konfirmasi sebelum mengganti dataset SQLite aktif.',
  'importEntry.step.file': 'Berkas',
  'importEntry.step.preview': 'Periksa',
  'importEntry.step.confirm': 'Konfirmasi',
  'importEntry.choose.headline': 'Muat tahun kalender dari berkas JSON',
  'importEntry.choose.supporting':
    'Aplikasi hanya membaca berkas yang Anda pilih di perangkat ini. Tidak ada perubahan sampai Anda mengonfirmasi penggantian.',
  'importEntry.validating.headline': 'Memeriksa berkas Anda',
  'importEntry.validating.supporting':
    'Mengurai JSON, memvalidasi struktur, dan menyusun daftar hari. Biasanya hanya sebentar.',
  'importEntry.review.headline': 'Berkas terlihat baik',
  'importEntry.review.supporting':
    'Tinjau ringkasan di bawah. Saat melanjutkan, Anda akan mengonfirmasi penggantian tahun aktif.',
  'importEntry.confirm.screenTitle': 'Konfirmasi penggantian',
  'importEntry.confirm.compare': '{{currentYear}} → {{importedYear}}',
  'importEntry.confirm.bullet1':
    'Kalender SQLite tahun aktif sepenuhnya diganti; tidak ada penggabungan.',
  'importEntry.confirm.bullet2':
    'Hanya perangkat ini yang terpengaruh; tidak ada unggahan ke cloud.',
  'importEntry.confirm.bullet3':
    'Anda dapat mengimpor berkas lain nanti dari pengaturan jika perlu memperbaiki kesalahan.',
  'importEntry.confirm.backToReview': 'Kembali ke ringkasan',
  'importEntry.importing.headline': 'Menyimpan ke penyimpanan lokal',
  'importEntry.importing.supporting':
    'Menulis tahun tervalidasi ke SQLite. Harap biarkan aplikasi tetap terbuka.',
  'importEntry.success.headline': 'Impor selesai',
  'importEntry.success.supporting':
    'Tahun {{year}} sekarang menjadi kalender aktif di perangkat ini.',
  'importEntry.success.toCalendar': 'Buka tampilan tahun',
  'importEntry.error.tryAgain': 'Coba lagi',
  'importEntry.error.pickAnotherFile': 'Pilih berkas lain',
  'importEntry.error.startOver': 'Mulai dari awal',
  'importEntry.aiPrompt.title': 'Buat dengan AI',
  'importEntry.aiPrompt.description':
    'Butuh kalender untuk negara atau tahun lain? Ketuk tombol di bawah untuk menyalin prompt. Lalu buka chat AI mana pun (Gemini, ChatGPT, DeepSeek), tempelkan prompt, dan dalam pesan terpisah tambahkan tugas Anda — misalnya:\n\n"Buat kalender produksi Armenia 2026 sesuai aturan resmi negara: hari libur nasional, akhir pekan biasa, pemindahan hari kerja/libur pengganti jika ada, serta hari kerja pendek menjelang libur jika berlaku. Kembalikan satu file JSON siap impor tepat seperti skema di prompt: field year; holidays lengkap dengan name_ru dan name_en (opsional: field nama lokal seperti name_hy); array weekends dan preholidays tanpa tanggal rangkap; hanya JSON yang valid secara sintaks, tanpa penjelasan dan tanpa blok markdown."\n\nSimpan balasan sebagai .json (atau gunakan layar tempel JSON) dan impor di sini.',
  'importEntry.aiPrompt.copyButton': 'Salin prompt ke papan klip',
  'importEntry.aiPrompt.copied': 'Prompt disalin!',
  'importEntry.textJson.title': 'Tempel JSON siap pakai',
  'importEntry.textJson.description':
    'Tempelkan teks JSON lengkap di sini. Jika strukturnya valid, aplikasi akan mengurainya otomatis dan membuka langkah pemeriksaan.',
  'importEntry.textJson.placeholder': 'Tempel JSON kalender di sini...',
  'importEntry.textJson.pasteButton': 'Tempel teks',
  'importEntry.textJson.sourceName': 'Teks JSON yang ditempel',
} satisfies Record<TranslationKey, string>;
