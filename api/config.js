module.exports = (req, res) => {
  const e = process.env;
  const pick = (...names) => {
    for (const n of names) if (e[n] && String(e[n]).trim()) return String(e[n]).trim();
    return '';
  };
  const cfg = {
    firebase: {
      apiKey: pick('FIREBASE_API_KEY', 'apiKey', 'NEXT_PUBLIC_FIREBASE_API_KEY'),
      authDomain: pick('FIREBASE_AUTH_DOMAIN', 'authDomain', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
      projectId: pick('FIREBASE_PROJECT_ID', 'projectId', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
      storageBucket: pick('FIREBASE_STORAGE_BUCKET', 'storageBucket', 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: pick('FIREBASE_MESSAGING_SENDER_ID', 'messagingSenderId', 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
      appId: pick('FIREBASE_APP_ID', 'appId', 'NEXT_PUBLIC_FIREBASE_APP_ID')
    },
    cloudinary: {
      cloudName: pick('CLOUDINARY_CLOUD_NAME', 'cloudName'),
      uploadPreset: pick('CLOUDINARY_UPLOAD_PRESET', 'uploadPreset')
    }
  };
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
  res.status(200).send('window.LCF_CONFIG=' + JSON.stringify(cfg) + ';');
};
