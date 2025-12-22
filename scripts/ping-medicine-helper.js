const https = require('https');

// ===================== 仅配置 medicine-helper 项目 =====================
const supabaseUrl = process.env.SUPABASE_URL_MEDICINE; // 新项目专属环境变量
const apiKey = process.env.SUPABASE_ANON_KEY_MEDICINE;
const tableName = 'product_models'; // 新项目的轻量表（确保存在）
// ======================================================================

// 检查环境变量
if (!supabaseUrl || !apiKey) {
  console.error('❌ 请设置 SUPABASE_URL_MEDICINE 和 SUPABASE_ANON_KEY_MEDICINE 环境变量');
  process.exit(1);
}

// 封装 Ping 函数（仅针对 medicine-helper）
function pingSupabase() {
  const url = new URL(supabaseUrl);
  const options = {
    hostname: url.hostname,
    path: `/rest/v1/${tableName}?select=*&limit=1`, // 轻量查询（仅1条数据）
    method: 'GET',
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal' // 只返回状态，不返回数据
    }
  };

  const req = https.request(options, (res) => {
    console.log(`[${new Date().toISOString()}] medicine-helper 状态: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('✅ medicine-helper ping 成功');
      process.exit(0);
    } else {
      console.log(`⚠️ medicine-helper 响应状态: ${res.statusCode}`);
      process.exit(1);
    }
  });

  // 5秒超时处理
  req.setTimeout(5000, () => {
    req.abort();
    console.error(`[${new Date().toISOString()}] ❌ medicine-helper 请求超时`);
    process.exit(1);
  });

  // 错误处理
  req.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] ❌ medicine-helper 报错:`, error.message);
    process.exit(1);
  });

  req.end();
}

// 执行激活
pingSupabase();
