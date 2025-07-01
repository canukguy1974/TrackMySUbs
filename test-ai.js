// Load environment variables
require('dotenv').config();

// Test AI functionality
async function testAI() {
  console.log('Testing AI functionality...');
  
  // Check environment variables
  const googleApiKey = process.env.GOOGLE_API_KEY;
  console.log('Google API Key configured:', googleApiKey ? '✅ Yes' : '❌ No');
  
  if (!googleApiKey) {
    console.error('❌ GOOGLE_API_KEY is missing from environment variables');
    return;
  }
  
  // Test email content
  const testEmail = `
Subject: Your Netflix subscription has been renewed

Hi John,

Your Netflix subscription has been automatically renewed for another month.

Plan: Netflix Premium
Amount: $15.99
Payment method: Visa ending in 1234
Next billing date: January 15, 2025

Thank you for being a Netflix subscriber!

Best regards,
Netflix Team
  `;
  
  try {
    // Import the AI function (this would need to be adapted for actual testing)
    console.log('✅ Test email prepared');
    console.log('Email length:', testEmail.length, 'characters');
    
    // For now, just verify the environment is set up correctly
    console.log('✅ AI test setup completed - ready for integration testing');
    
  } catch (error) {
    console.error('❌ AI test failed:', error.message);
  }
}

testAI();
