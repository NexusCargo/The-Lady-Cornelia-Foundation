const admin = require('firebase-admin');

function db() {
  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
    const sa = JSON.parse(raw);
    sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  }
  return admin.firestore();
}

async function recordDonation(tx) {
  const meta = tx.metadata || {};
  const doc = {
    reference: tx.reference,
    amount: (tx.amount || 0) / 100,
    currency: tx.currency || 'GHS',
    email: (tx.customer && tx.customer.email) || '',
    name: meta.donor_name || '',
    designation: meta.designation || 'General',
    channel: tx.channel || '',
    status: tx.status === 'success' ? 'success' : tx.status,
    paidAt: tx.paid_at ? admin.firestore.Timestamp.fromDate(new Date(tx.paid_at)) : admin.firestore.FieldValue.serverTimestamp(),
    source: 'paystack'
  };
  const ref = db().collection('donations').doc(tx.reference);
  const snap = await ref.get();
  if (!snap.exists) doc.createdAt = admin.firestore.FieldValue.serverTimestamp();
  await ref.set(doc, { merge: true });
  return doc;
}

module.exports = { recordDonation };
