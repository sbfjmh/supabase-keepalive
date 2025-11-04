const https = require('https');

// 从环境变量获取配置
const supabaseUrl = process.env.SUPABASE_URL;
const apiKey = process.env.SUPABASE_ANON_KEY;
const tableName = 'hanzi_medians'; // 确保表存在且有权限

if (!supabaseUrl || !apiKey) {
  console.error('❌ 请设置 SUPABASE_URL 和 SUPABASE_ANON_KEY 环境变量');
  process.exit(1);
}

// 只执行一次 ping 请求，无需定时（工作流会定时触发脚本）
function pingSupabase() {
  const url = new URL(supabaseUrl);
  const options = {
    hostname: url.hostname,
    path: `/rest/v1/${tableName}?select=*&limit=1`, // 只查1条数据，轻量
    method: 'GET',
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal' // 只返回状态，不返回数据
    }
  };

  const req = https.request(options, (res) => {
    console.log(`[${new Date().toISOString()}] Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('✅ Supabase ping successful');
      process.exit(0); // 成功后正常退出
    } else {
      console.log(`⚠️ Supabase responded with status: ${res.statusCode}`);
      process.exit(1); // 非200状态视为失败，工作流会记录
    }
  });

  // 超时处理
  req.setTimeout(5000, () => {
    req.abort();
    console.error(`[${new Date().toISOString()}] ❌ Request timed out`);
    process.exit(1); // 超时视为失败
  });

  // 错误处理
  req.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] ❌ Error pinging Supabase:`, error.message);
    process.exit(1); // 错误视为失败
  });

  req.end();
}

// 直接执行一次，完成后退出
pingSupabase();
