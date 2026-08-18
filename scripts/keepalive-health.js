/**
 * 记录健康小程序 - Supabase 数据库保活脚本
 * 通过定时查询保持数据库活跃，防止免费版因长时间不活动被暂停
 */

const https = require('https');

// 从环境变量读取配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('错误: 缺少环境变量 SUPABASE_URL 或 SUPABASE_KEY');
  process.exit(1);
}

const hostname = supabaseUrl.replace('https://', '').replace('http://', '');

/**
 * 发送请求到 Supabase REST API
 */
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data: data });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

/**
 * 主函数：执行保活查询
 */
async function keepalive() {
  const now = new Date().toISOString();
  console.log(`\n========================================`);
  console.log(`记录健康 - Supabase 保活脚本`);
  console.log(`执行时间: ${now}`);
  console.log(`目标地址: ${supabaseUrl}`);
  console.log(`========================================\n`);

  // 查询 users 表（只取1条），保持数据库活跃
  try {
    console.log('正在查询数据库...');
    const result = await makeRequest('/rest/v1/users?limit=1');

    if (result.statusCode === 200) {
      console.log(`✓ 保活成功! 状态码: ${result.statusCode}`);
      console.log(`✓ 数据库响应正常\n`);
      console.log(`========================================`);
      console.log(`保活完成，数据库处于活跃状态`);
      console.log(`========================================\n`);
      process.exit(0);
    } else {
      console.error(`✗ 保活失败! 状态码: ${result.statusCode}`);
      console.error(`✗ 响应: ${result.data}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`✗ 请求异常: ${error.message}\n`);
    process.exit(1);
  }
}

keepalive();