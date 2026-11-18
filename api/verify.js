const { recordDonation } = require('./_donations');

module.exports = async (req, res) => {
  const ref = String((req.query && req.query.reference) || '');
  if (!/^[A-Za-z0-9_.=-]{6,64}$/.test(ref)) return res.status(400).json({ ok: false, error: 'bad reference' });
  try {
    const r = await fetch('https://api.paystack.co/transaction/verify/' + encodeURIComponent(ref), {
      headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY }
    });
    const j = await r.json();
    if (!j.status || !j.data || j.data.status !== 'success') return res.status(200).json({ ok: false, status: j.data && j.data.status });
    const d = await recordDonation(j.data);
    res.status(200).json({ ok: true, amount: d.amount });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
};
