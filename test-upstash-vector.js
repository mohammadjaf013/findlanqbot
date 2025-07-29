const { 
  saveFileToVector, 
  searchInVector, 
  getFilesList, 
  deleteFileFromVector, 
  getVectorStats 
} = require('./src/services/upstash-vector');

// تست متن نمونه
const sampleText = `
فنلاند (به فنلاندی: Suomi) کشوری در شمال اروپا است که با سوئد، نروژ و روسیه همسایه است.
پایتخت فنلاند هلسینکی است و این کشور دارای ۵.۵ میلیون نفر جمعیت است.
فنلاند به دلیل سیستم آموزشی عالی، کیفیت زندگی بالا و نوآوری در فناوری شناخته شده است.
این کشور یکی از بهترین کشورها برای زندگی و کار است.
`;

async function testUpstashVector() {
  console.log('🧪 شروع تست Upstash Vector...\n');

  try {
    // تست 1: بررسی آمار اولیه
    console.log('1️⃣ بررسی آمار اولیه:');
    const initialStats = await getVectorStats();
    console.log(initialStats);
    console.log('');

    // تست 2: آپلود فایل تست
    console.log('2️⃣ آپلود فایل تست:');
    const uploadResult = await saveFileToVector('test-finland.txt', sampleText, {
      uploadedAt: new Date().toISOString(),
      source: 'test'
    });
    console.log(uploadResult);
    console.log('');

    // تست 3: جستجو در فایل آپلود شده
    console.log('3️⃣ جستجو در فایل:');
    const searchResult = await searchInVector('فنلاند کجاست؟', 3);
    console.log(searchResult);
    console.log('');

    // تست 4: دریافت لیست فایل‌ها
    console.log('4️⃣ لیست فایل‌ها:');
    const filesList = await getFilesList();
    console.log(filesList);
    console.log('');

    // تست 5: آمار نهایی
    console.log('5️⃣ آمار نهایی:');
    const finalStats = await getVectorStats();
    console.log(finalStats);
    console.log('');

    // تست 6: حذف فایل تست
    console.log('6️⃣ حذف فایل تست:');
    const deleteResult = await deleteFileFromVector('test-finland.txt');
    console.log(deleteResult);
    console.log('');

    console.log('✅ همه تست‌ها با موفقیت انجام شد!');

  } catch (error) {
    console.error('❌ خطا در تست:', error);
  }
}

// اجرای تست
if (require.main === module) {
  testUpstashVector();
}

module.exports = { testUpstashVector };