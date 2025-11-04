const https = require('https');

// 从环境变量获取配置
const supabaseUrl = process.env.SUPABASE_URL;
const apiKey = process.env.SUPABASE_KEY;
const tableName = 'hanzi_medians'; // 替换为实际表名
const interval = 300000; // 5分钟（300000毫秒）

if (!supabaseUrl || !apiKey) {
  console.error('❌ 请设置 SUPABASE_URL 和 SUPABASE_KEY 环境变量');
  process.exit(1);
}

function pingSupabase() {
  const url = new URL(supabaseUrl);
  const options = {
    hostname: url.hostname,
    path: `/rest/v1/${tableName}?select=*&limit=1`, // 只查询1条数据
    method: 'GET',
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`[${new Date().toISOString()}] Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('✅ Supabase ping successful');
    } else {
      console.log(`⚠️ Supabase responded with status: ${res.statusCode}`);
    }
  });

  // 超时处理
  req.setTimeout(5000, () => {
    req.abort();
    console.error(`[${new Date().toISOString()}] ❌ Request timed out`);
  });

  // 错误处理
  req.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] ❌ Error pinging Supabase:`, error.message);
  });

  req.end();
}

// 启动定时任务
console.log(`🚀 开始 Supabase 保活，间隔 ${interval/1000} 秒`);
pingSupabase(); // 立即执行一次
setInterval(pingSupabase, interval);
