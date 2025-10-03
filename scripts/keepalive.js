#!/usr/bin/env node

/**
 * Jscbc: Render网站保活脚本
 * 用于防止Render免费服务15分钟休眠
 */

const https = require('https');
const http = require('http');

// 配置
const SITE_URL = process.env.SITE_URL || 'https://chuju-script-library.onrender.com';
const ENDPOINTS = [
  '/',
  '/api/scripts',
  '/api/scripts/F80C637DAB8033C49077E14C7A95BB09',
  '/scripts/F80C637DAB8033C49077E14C7A95BB09'
];

/**
 * 发送HTTP请求
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

/**
 * 保活主函数
 */
async function keepAlive() {
  console.log(`🚀 开始保活任务 - ${new Date().toLocaleString()}`);
  console.log(`📍 目标网站: ${SITE_URL}`);
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const url = `${SITE_URL}${endpoint}`;
    
    try {
      console.log(`🔍 访问: ${url}`);
      const startTime = Date.now();
      
      const response = await makeRequest(url);
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ ${endpoint}: ${response.statusCode} (${responseTime}ms)`);
      
      results.push({
        endpoint,
        statusCode: response.statusCode,
        responseTime,
        success: response.statusCode >= 200 && response.statusCode < 400
      });
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
      
      results.push({
        endpoint,
        statusCode: 0,
        responseTime: 0,
        success: false,
        error: error.message
      });
    }
    
    // 避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 统计结果
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const avgResponseTime = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.responseTime, 0) / successCount || 0;
  
  console.log('\n📊 保活结果统计:');
  console.log(`✅ 成功: ${successCount}/${totalCount}`);
  console.log(`⏱️  平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
  
  if (successCount === totalCount) {
    console.log('🎉 所有端点访问成功！');
    process.exit(0);
  } else {
    console.log('⚠️  部分端点访问失败！');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  keepAlive().catch(error => {
    console.error('❌ 保活任务失败:', error);
    process.exit(1);
  });
}

module.exports = { keepAlive, makeRequest };
