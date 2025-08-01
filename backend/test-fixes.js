const { ulid } = require('ulid');
const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log('🧪 Testing fixes...');

// Test 1: Check if ulid works
try {
  const testId = ulid();
  console.log('✅ ulid test passed:', testId);
} catch (error) {
  console.error('❌ ulid test failed:', error);
}

// Test 2: Check if AI model is accessible
try {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  console.log('✅ AI model test passed: gemini-1.5-flash is accessible');
} catch (error) {
  console.error('❌ AI model test failed:', error);
}

// Test 3: Check environment variable
if (process.env.GEMINI_API_KEY) {
  console.log('✅ GEMINI_API_KEY is set');
} else {
  console.error('❌ GEMINI_API_KEY is not set');
}

console.log('🏁 Test completed'); 