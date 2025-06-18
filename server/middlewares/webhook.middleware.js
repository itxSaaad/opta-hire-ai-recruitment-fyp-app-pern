const colors = require('colors');

const rawBodyMiddleware = (req, res, next) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    console.log('\n' + '='.repeat(86).cyan);
    console.log(`🎣 WEBHOOK RAW BODY PROCESSING`.bold.cyan);
    console.log('='.repeat(86).cyan);
    console.log(`🔍 Method:     ${req.method}`.cyan);
    console.log(`🌐 URL:        ${req.originalUrl}`.cyan);
    console.log(`⏰ Timestamp:  ${new Date().toLocaleString()}`.magenta);
    console.log('='.repeat(86).cyan);

    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk.toString();
    });
    req.on('end', () => {
      req.rawBody = rawBody;

      if (process.env.NODE_ENV === 'development') {
        console.log('-'.repeat(86).cyan);
        console.log(
          `📦 Raw Body:   ${rawBody ? rawBody.substring(0, 200) + '...' : 'Empty'}`
            .cyan
        );
      }

      console.log(`✅ Raw body processed successfully`.green);
      console.log('='.repeat(86).cyan);
      next();
    });
  } else {
    next();
  }
};

module.exports = rawBodyMiddleware;
