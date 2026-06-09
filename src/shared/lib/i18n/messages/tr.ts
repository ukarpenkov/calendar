import type { TranslationKey } from './en';

export const trTranslations = {
  'common.appName': 'Takvim',
  'common.hoursUnit': 'sa',
  'common.backToYear': 'Yıla dön',
  'common.navigateBack': 'Geri',
  'common.cancel': 'İptal',
  'app.error.bootstrapTitle': 'Yerel takvim verileri başlatılamadı.',
  'app.error.bootstrapSubtitle':
    'Cihaz depolamasını kontrol edin ve yeniden deneyin. Uygulamayı yeniden başlatmayı da deneyebilirsiniz.',
  'app.error.bootstrapRetry': 'Yeniden dene',
  'app.error.monthTitle': 'Seçilen ay açılamadı.',
  'app.error.monthSubtitle': 'Yıl genel görünümüne dönüp tekrar deneyin.',
  'splash.loadingTitle': 'Çevrimdışı yıl görünümü yükleniyor',
  'splash.loadingSubtitle': 'Yerel takvim verileri başlatılıyor...',
  'year.menu.settings': 'Ayarlar',
  'year.menu.vacation': 'Tatil',
  'year.home.title': '{{year}} yılı',
  'year.summary.work': 'İş',
  'year.summary.off': 'Din',
  'year.summary.days': 'Gün',
  'month.selectedDay.eyebrow': 'Seçilen gün',
  'month.totals.totalDays': 'Toplam gün',
  'month.totals.workingDays': 'İş günleri',
  'month.totals.nonWorkingDays': 'Tatil günleri',
  'month.totals.workHours': 'Çalışma saatleri',
  'month.nav.previousMonth': 'Önceki ay',
  'month.nav.nextMonth': 'Sonraki ay',
  'settings.title': 'Ayarlar',
  'settings.sections.calendarData.title': 'Takvim verileri',
  'settings.sections.calendarData.subtitle':
    'Geçerli etkin yıl ve planlanan içe aktarma adımları.',
  'settings.rows.activeYear.title': 'Etkin yıl',
  'settings.rows.activeYear.subtitle':
    'Uygulamada şu anda yüklü olan SQLite veri kümesi {{year}}.',
  'settings.rows.importYear.title': 'Yıl içe aktar (JSON)',
  'settings.rows.importYear.subtitle':
    'JSON ile yıl değiştirme akışı için ayrı bir giriş ekranı açar.',
  'settings.rows.importYear.action': 'Aç',
  'settings.rows.bundledCalendar.title': 'Üretim takvimi (2026)',
  'settings.rows.bundledCalendar.subtitle': 'Yerleşik veri kümesi: {{region}}.',
  'settings.bundledCalendar.chip.ru': 'Rusya',
  'settings.bundledCalendar.chip.tr': 'Türkiye',
  'settings.bundledCalendar.chip.id': 'Endonezya',
  'settings.bundledCalendar.chip.ja': 'Japonya',
  'settings.sections.appearance.title': 'Görünüm',
  'settings.sections.appearance.subtitle':
    'Tema ayarları genel uygulama bağlamı üzerinden yönetilir.',
  'settings.rows.darkTheme.title': 'Koyu tema',
  'settings.rows.darkTheme.subtitle': 'Geçerli mod: {{mode}}.',
  'settings.sections.localization.title': 'Dil',
  'settings.sections.localization.subtitle':
    'Uygulama arayüzünde kullanılan dili değiştirir.',
  'settings.rows.language.title': 'Arayüz dili',
  'settings.rows.language.subtitle': 'Geçerli dil: {{language}}.',
  'settings.rows.language.userImportHint':
    'Takvim JSON içe aktarımından geliyor: arayüz dilini değiştirmek veriyi değiştirmez. Paketlenmiş takvim için aşağıdaki «Üretim takvimi (2026)» bölümünü kullanın.',
  'settings.languageSwitch.userJsonCalendar': 'JSON takvimi',
  'settings.sections.about.title': 'Hakkında',
  'settings.sections.about.subtitle':
    'Yerel öncelikli bu sürüm için servis bilgileri.',
  'settings.about.app': 'Uygulama',
  'settings.about.version': 'Sürüm',
  'settings.about.storage': 'Depolama',
  'settings.about.defaultDataset': 'Varsayılan veri kümesi',
  'settings.about.theme': 'Tema',
  'settings.about.language': 'Dil',
  'settings.about.telegram': 'Telegram',
  'settings.about.appValue': 'Takvim',
  'settings.about.storageValue': 'Çevrimdışı SQLite',
  'settings.about.defaultDatasetValue': 'Üretim takvimi 2026',
  'year.reminder.title': 'Gelecek yıl için JSON şablonu',
  'year.reminder.body':
    '{{year}} şablonu Telegram’da yayınlanacak. Hazır olduğunda yeni JSON’u indirmek için kanalı açın.',
  'year.reminder.action': 'Telegram’ı aç',
  'importEntry.title': 'JSON içe aktarma',
  'importEntry.eyebrow': 'İçe aktarma girişi',
  'importEntry.heroTitle': 'Yerel JSON ile yıl değişimine hazırlık',
  'importEntry.heroSubtitle':
    'Bu ekran, etkin yılı yerel bir JSON dosyasıyla değiştirmek için ayrılmış giriş noktasıdır.',
  'importEntry.currentYear.title': 'Geçerli etkin yıl',
  'importEntry.currentYear.subtitle':
    'Bir sonraki adımı onaylarsanız {{year}} için SQLite veri kümesi birleştirilmeden değiştirilir.',
  'importEntry.fileCard.title': 'Seçilen JSON dosyası',
  'importEntry.fileCard.idleSubtitle':
    'Doğrulamayı başlatmak için yerel bir JSON dosyası seçin. Onaylanana kadar etkin yıl değişmez.',
  'importEntry.fileCard.readySubtitle':
    'Seçilen dosya doğrulamayı geçti ve etkin SQLite veri kümesinin yerini almaya hazır.',
  'importEntry.fileCard.fileName': 'Dosya',
  'importEntry.fileCard.detectedYear': 'Algılanan yıl',
  'importEntry.fileCard.fileSize': 'Boyut',
  'importEntry.preview.title': 'Doğrulanmış içe aktarma önizlemesi',
  'importEntry.preview.subtitle':
    '{{year}} yılı doğrulamayı geçti ve geçerli yerel veri kümesinin yerini alabilir.',
  'importEntry.preview.totalDays': 'Toplam gün',
  'importEntry.preview.workingDays': 'İş günleri',
  'importEntry.preview.nonWorkingDays': 'İş olmayan günler',
  'importEntry.preview.workHours': 'Çalışma saatleri',
  'importEntry.actions.chooseFile': 'JSON dosyası seç',
  'importEntry.actions.chooseAnotherFile': 'Başka dosya seç',
  'importEntry.actions.validating': 'Dosya doğrulanıyor...',
  'importEntry.actions.replaceYear': 'Etkin yılı değiştir',
  'importEntry.actions.importing': 'Yerel veri kümesi güncelleniyor...',
  'importEntry.confirm.title': 'Etkin takvim yılı değiştirilsin mi?',
  'importEntry.confirm.body':
    'Geçerli yıl {{currentYear}}, yerel SQLite’da {{importedYear}} ile tamamen değiştirilecektir. Veri birleştirilmez.',
  'importEntry.confirm.action': 'Yılı değiştir',
  'importEntry.error.validationTitle': 'Doğrulama başarısız',
  'importEntry.error.validationBody':
    'Seçilen JSON dosyası doğrulamayı geçmedi. Etkin takvim yılı değişmedi.',
  'importEntry.error.unsupportedTitle': 'Desteklenmeyen dosya',
  'importEntry.error.unsupportedBody':
    'Takvim içe aktarma yapısına sahip bir `.json` dosyası seçin.',
  'importEntry.error.readTitle': 'Dosya okunamadı',
  'importEntry.error.readBody':
    'Seçilen dosya cihaz depolamasından okunamadı. Etkin takvim yılı değişmedi.',
  'importEntry.error.pickerTitle': 'Dosya seçici açılamadı',
  'importEntry.error.pickerBody':
    'Sistem dosya seçicisi okunabilir bir JSON dosyası döndürmedi.',
  'importEntry.error.replaceTitle': 'Etkin yıl değiştirilemedi',
  'importEntry.error.replaceBody':
    'Doğrulama başarılı oldu ancak yeni yıl SQLite’a yazılamadı. Geçerli takvim etkin kaldı.',
  'importEntry.error.replaceDetail':
    'Yerel depolama alanıını kontrol edip içe aktarmayı yeniden deneyin.',
  'importEntry.error.genericTitle': 'İçe aktarma başarısız',
  'importEntry.error.genericBody':
    'İçe aktarma akışı etkin takvim yılı değiştirilmeden durdu.',
  'importEntry.error.genericDetail':
    'Seçilen dosyayı gözden geçirip tekrar deneyin.',
  'importEntry.flow.title': 'Bu içe aktarma nasıl çalışır',
  'importEntry.flow.step1': '1. Cihazdan yerel bir JSON dosyası seçin.',
  'importEntry.flow.step2':
    '2. Herhangi bir yazmadan önce seçilen yılı doğrulayın ve normalize edin.',
  'importEntry.flow.step3':
    '3. Etkin SQLite veri kümesini değiştirmeden önce onay isteyin.',
  'importEntry.step.file': 'Dosya',
  'importEntry.step.preview': 'Kontrol',
  'importEntry.step.confirm': 'Onay',
  'importEntry.choose.headline': 'Takvim yılını JSON dosyasından yükleyin',
  'importEntry.choose.supporting':
    'Uygulama yalnızca bu cihazda seçtiğiniz dosyayı okur. Onay verene kadar hiçbir şey değişmez.',
  'importEntry.validating.headline': 'Dosyanız kontrol ediliyor',
  'importEntry.validating.supporting':
    'JSON ayrıştırılıyor, yapı doğrulanıyor ve gün listesi oluşturuluyor. Bu genelde kısa sürer.',
  'importEntry.review.headline': 'Dosya uygun görünüyor',
  'importEntry.review.supporting':
    'Aşağıdaki özeti inceleyin. Devam ettiğinizde etkin yılı değiştirmeyi onaylayacaksınız.',
  'importEntry.confirm.screenTitle': 'Değişikliği onaylayın',
  'importEntry.confirm.compare': '{{currentYear}} → {{importedYear}}',
  'importEntry.confirm.bullet1':
    'Etkin yılın SQLite takvimi tamamen değiştirilir; birleştirme yoktur.',
  'importEntry.confirm.bullet2':
    'Yalnızca bu cihaz etkilenir; buluta yükleme yoktur.',
  'importEntry.confirm.bullet3':
    'Hata düzeltmek için daha sonra ayarlardan başka bir dosya içe aktarabilirsiniz.',
  'importEntry.confirm.backToReview': 'Özete dön',
  'importEntry.importing.headline': 'Yerel depolamaya kaydediliyor',
  'importEntry.importing.supporting':
    'Doğrulanan yıl SQLite’a yazılıyor. Lütfen uygulamayı açık tutun.',
  'importEntry.success.headline': 'İçe aktarma tamamlandı',
  'importEntry.success.supporting':
    '{{year}} yılı artık bu cihazdaki etkin takvimdir.',
  'importEntry.success.toCalendar': 'Yıl görünümünü aç',
  'importEntry.error.tryAgain': 'Yeniden dene',
  'importEntry.error.pickAnotherFile': 'Başka dosya seç',
  'importEntry.error.startOver': 'Baştan başla',
  'importEntry.aiPrompt.title': 'AI ile oluştur',
  'importEntry.aiPrompt.description':
    'Farklı bir ülke veya yıl için takvim mi gerekiyor? Aşağıdaki düğmeye dokunarak hazır istemi kopyalayın. Ardından herhangi bir AI sohbeti (Gemini, ChatGPT, DeepSeek) açın, istemi yapıştırın ve şöyle yazın:\n\n"Ermenistan 2026 üretim takvimi oluştur"\n\nSonucu .json olarak kaydedin ve buradan içe aktarın.',
  'importEntry.aiPrompt.copyButton': 'İstemi panoya kopyala',
  'importEntry.aiPrompt.copied': 'İstek kopyalandı!',
  'importEntry.textJson.title': 'Hazır JSON metnini yapıştır',
  'importEntry.textJson.description':
    'Tam JSON metnini buraya yapıştırın. Yapı geçerliyse uygulama metni otomatik olarak ayrıştırır ve kontrol adımını açar.',
  'importEntry.textJson.placeholder': 'Takvim JSON’unu buraya yapıştırın...',
  'importEntry.textJson.pasteButton': 'Metni yapıştır',
  'importEntry.textJson.sourceName': 'Yapıştırılan JSON metni',
} satisfies Record<TranslationKey, string>;
