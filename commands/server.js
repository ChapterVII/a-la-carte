const http = require('http');
const url  = require('url');
const fs = require('fs');
const path = require('path');

module.exports = () => http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;
  if (pathname === '/userConfig') {
    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
    const configPath = path.resolve(__dirname, '../config.json');
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath);
      if (data) {
        res.end(JSON.stringify({
          status: 'successed',
          data: JSON.parse(data),
        }));
        return;
      }
    }
    res.end(JSON.stringify({
      status: 'failed',
      message: '请联系管理员',
    }));
  }
}).listen(1239, '0.0.0.0', () => {
  console.log('同步配置信息服务已开启')
});