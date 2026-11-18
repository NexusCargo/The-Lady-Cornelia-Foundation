module.exports = (req, res) => {
  const e = process.env;
  const cfg = {
    firebase: {
      apiKey: e.FIREBASE_API_KEY || '',
      authDomain: e.FIREBASE_AUTH_DOMAIN || '',
      projectId: e.FIREBASE_PROJECT_ID || '',
      storageBucket: e.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: e.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: e.FIREBASE_APP_ID || ''
    },
    cloudinary: {
      cloudName: e.CLOUDINARY_CLOUD_NAME || '',
      uploadPreset: e.CLOUDINARY_UPLOAD_PRESET || ''
    }
  };
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
  res.status(200).send('window.LCF_CONFIG=' + JSON.stringify(cfg) + ';');
};
