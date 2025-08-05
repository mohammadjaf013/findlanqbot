const { 
  addConsultation, 
  getAllConsultations 
} = require('../services/turso-db');

module.exports = (app) => {
  // روت برای ارسال درخواست مشاوره
  app.post('/api/consultation/submit', async (c) => {
    try {
      const consultationData = await c.req.json();
      
      if (!consultationData || Object.keys(consultationData).length === 0) {
        return c.json({ 
          error: 'داده‌های مشاوره نمی‌تواند خالی باشد' 
        }, 400);
      }

      const id = await addConsultation(consultationData);
      
      return c.json({ 
        success: true,
        id,
        message: 'درخواست مشاوره با موفقیت ثبت شد'
      });
      
    } catch (error) {
      console.error('Error in /api/consultation/submit:', error);
      return c.json({ 
        error: error.message || 'خطای داخلی سرور' 
      }, 500);
    }
  });

  // روت برای دریافت لیست درخواست‌های مشاوره
  app.get('/api/consultation/list', async (c) => {
    try {
      const consultations = await getAllConsultations();
      
      return c.json({ 
        success: true,
        consultations,
        total: consultations.length
      });
      
    } catch (error) {
      console.error('Error in /api/consultation/list:', error);
      return c.json({ 
        error: error.message || 'خطا در دریافت لیست مشاوره‌ها' 
      }, 500);
    }
  });
};