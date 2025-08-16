// Test script for cleanTableFormat function
const cleanTableFormat = (content) => {
  // If content contains table-like structure, try to fix common issues
  if (content.includes('|')) {
    // Check if the table is all on one line (broken format)
    if (!content.includes('\n') && content.includes('|')) {
      // Split by | and reconstruct the table properly
      const parts = content.split('|').map(part => part.trim()).filter(part => part);
      
      // Group into rows of 4 columns (based on your table structure)
      const rows = [];
      for (let i = 0; i < parts.length; i += 4) {
        const row = parts.slice(i, i + 4);
        if (row.length > 0) {
          // Pad the row to exactly 4 columns
          while (row.length < 4) {
            row.push('');
          }
          rows.push('| ' + row.join(' | ') + ' |');
        }
      }
      
      // Add a header separator line if it's a new table being formed
      if (rows.length > 0) {
        const headerSeparator = '| :--- | :--- | :--- | :--- |';
        rows.splice(1, 0, headerSeparator);
      }

      return rows.join('\n');
    }
    
    // Normal case - split into lines
    const lines = content.split('\n');
    const cleanedLines = lines.map(line => {
      // Remove extra spaces around pipes and ensure proper table format
      let cleaned = line.trim();
      if (cleaned.includes('|')) {
        // Ensure the line starts and ends with |
        if (!cleaned.startsWith('|')) {
          cleaned = '| ' + cleaned;
        }
        if (!cleaned.endsWith('|')) {
          cleaned = cleaned + ' |';
        }
        // Clean up spacing around pipes
        cleaned = cleaned.replace(/\s*\|\s*/g, ' | ');
      }
      return cleaned;
    });
    return cleanedLines.join('\n');
  }
  return content;
};

// Test with the user's example
const testTable = "| برنامه/خدمت فنلاندکیو ✨ | نوع هزینه 💰 | مبلغ (یورو) | توضیحات 📝 | | :----------------------- | :---------- | :---------- | :-------- | | دبیرستان فنلاند | شهریه تحصیل | رایگان | در مدارس دولتی فنلاند | | | تمکن مالی دانش‌آموز (سالیانه) | ۹,۶۰۰ | برای پوشش هزینه‌های زندگی دانش‌آموز | | | | تمکن مالی خانواده سه‌نفره (ماهیانه) | ۲,۵۰۰ | برای والدین همراه | | | | هزینه زندگی دانش‌آموز (ماهیانه) | ۷۰۰ - ۱,۰۰۰ | بسته به شهر و سبک زندگی | | دوره‌های آمیس (Amis) | شهریه تحصیل | رایگان | در مدارس دولتی فنلاند | | | | تمکن مالی دانش‌آموز (سالیانه) | ۹,۶۰۰ | برای پوشش هزینه‌های زندگی دانش‌آموز | | | | تمکن مالی خانواده سه‌نفره (ماهیانه) | ۲,۵۰۰ | برای والدین همراه | | | | هزینه زندگی دانش‌آموز (ماهیانه) | ۸۰۰ - ۱,۰۰۰ | بسته به شهر و سبک زندگی | | | | هزینه اجاره خوابگاه (ماهیانه) | ۱۸۰ - ۳۰۰ | بسته به مدرسه (در برخی مدارس محدود، رایگان است) | | | | هزینه کرایه خانه (ماهی";

console.log('Original:', testTable);
console.log('Cleaned:', cleanTableFormat(testTable));
