const { test } = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const { once } = require('node:events');
const { sendAccountEmail } = require('../utils/mail');

// An isolated SMTP sink exercises Nodemailer's actual network transport.
// It binds only to loopback and never relays messages to an external server.
async function smtpSink(rejectMail = false) {
  const messages = [];
  const sockets = new Set();
  const server = net.createServer(socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.on('error', () => {});
    socket.setEncoding('utf8');
    let buffer = '';
    let data = null;
    socket.write('220 localhost test SMTP\r\n');
    socket.on('data', chunk => {
      buffer += chunk;
      let end;
      while ((end = buffer.indexOf('\r\n')) !== -1) {
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (data !== null) {
          if (line === '.') {
            messages.push(data.join('\r\n'));
            data = null;
            socket.write('250 Accepted\r\n');
          } else data.push(line.replace(/^\.\./, '.'));
        } else if (/^(EHLO|HELO) /i.test(line)) socket.write('250 localhost\r\n');
        else if (/^MAIL FROM:/i.test(line)) socket.write(rejectMail ? '550 Sender rejected\r\n' : '250 OK\r\n');
        else if (/^RCPT TO:/i.test(line)) socket.write('250 OK\r\n');
        else if (line === 'DATA') { data = []; socket.write('354 End with dot\r\n'); }
        else if (line === 'QUIT') socket.end('221 Bye\r\n');
        else socket.write('250 OK\r\n');
      }
    });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return {
    messages,
    port: server.address().port,
    close: async () => {
      for (const socket of sockets) socket.destroy();
      await new Promise(resolve => server.close(resolve));
    },
  };
}

function configure(t, port) {
  const values = {
    SMTP_HOST: '127.0.0.1', SMTP_PORT: String(port), SMTP_SECURE: 'false',
    SMTP_USER: '', SMTP_PASSWORD: '', MAIL_FROM: 'Sniply <sender@example.test>',
    CLIENT_URL: 'http://localhost:5173',
  };
  const previous = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
  Object.assign(process.env, values);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

function textBody(message) {
  const [headers, ...parts] = message.split('\r\n\r\n');
  const body = parts.join('\r\n\r\n');
  if (/Content-Transfer-Encoding: base64/i.test(headers)) return Buffer.from(body, 'base64').toString('utf8');
  return body.replace(/=\r\n/g, '').replace(/=([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

test('actual SMTP transport delivers reset and verification links to a local sink', async t => {
  const smtp = await smtpSink();
  t.after(smtp.close);
  configure(t, smtp.port);
  const token = 'a'.repeat(64);
  await sendAccountEmail('recipient@example.test', 'reset', token);
  await sendAccountEmail('recipient@example.test', 'verification', token);
  assert.equal(smtp.messages.length, 2);
  assert.match(smtp.messages[0], /Subject: Reset your Sniply password/);
  assert.match(smtp.messages[1], /Subject: Verify your Sniply email/);
  assert.ok(textBody(smtp.messages[0]).includes('/reset-password#token=' + token));
  assert.ok(textBody(smtp.messages[1]).includes('/verify-email#token=' + token));
});

test('SMTP rejection propagates instead of reporting successful delivery', async t => {
  const smtp = await smtpSink(true);
  t.after(smtp.close);
  configure(t, smtp.port);
  await assert.rejects(sendAccountEmail('recipient@example.test', 'reset', 'b'.repeat(64)), /Sender rejected/);
  assert.equal(smtp.messages.length, 0);
});
