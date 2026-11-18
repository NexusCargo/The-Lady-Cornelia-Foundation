const crypto = require('crypto');
const { recordDonation } = require('./_donations');

function raw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const body = await raw(req);
  const sig = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '').update(body).digest('hex');
  if (sig !== req.headers['x-paystack-signature']) return res.status(401).end();
  try {
    const evt = JSON.parse(body.toString('utf8'));
    if (evt.event === 'charge.success') await recordDonation(evt.data);
    res.status(200).json({ received: true });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
};
module.exports.config = { api: { bodyParser: false } };
