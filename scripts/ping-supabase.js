// 简单的保活脚本
const https = require('https');

const supabaseUrl = process.env.SUPABASE_URL;
const apiKey = process.env.SUPABASE_KEY;

// 发送一个简单的查询请求
const options = {
  hostname: new URL(supabaseUrl).hostname,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('✅ Supabase ping successful');
  } else {
    console.log('⚠️ Supabase responded with non-200 status');
  }
});

req.on('error', (error) => {
  console.error('❌ Error pinging Supabase:', error.message);
});

req.end();
