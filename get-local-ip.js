// Quick script to get local IP address for mobile access
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIP();
const port = 3000;
const url = `http://${ip}:${port}`;

console.log('\n📱 Mobile Access Information:');
console.log('================================');
console.log(`Local IP: ${ip}`);
console.log(`Port: ${port}`);
console.log(`\n🌐 URL: ${url}`);
console.log('\n📲 QR Code Generator:');
console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`);
console.log('\n💡 Instructions:');
console.log('1. Make sure your mobile device is on the same WiFi network');
console.log('2. Open the QR code link above in your browser');
console.log('3. Scan the QR code with your phone camera');
console.log('4. Or manually enter the URL in your mobile browser');
console.log('\n⚠️  Make sure the React dev server is running (npm start)');
