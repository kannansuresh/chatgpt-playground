export function encryptDecrypt(plainOrEncryptedString: string, performEncryption = false) {
  try {
    const userHash = generateUserHash().toString();
    if (performEncryption) return CryptoJS.AES.encrypt(plainOrEncryptedString, userHash).toString();
    return CryptoJS.AES.decrypt(plainOrEncryptedString, userHash).toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return plainOrEncryptedString;
  }
}

export function encrypt(plainString: string) {
  const userHash = generateUserHash().toString();
  return CryptoJS.AES.encrypt(plainString, userHash).toString();
}

export function decrypt(encryptedString: string) {
  const userHash = generateUserHash().toString();
  return CryptoJS.AES.decrypt(encryptedString, userHash).toString(CryptoJS.enc.Utf8);
}

// Generate a hash based on the user's browser and machine properties
function generateUserHash() {
  const userAgent = navigator.userAgent;
  const platform =
    userAgent.indexOf('Win') !== -1
      ? 'Windows'
      : userAgent.indexOf('Mac') !== -1
      ? 'MacOS'
      : userAgent.indexOf('X11') !== -1
      ? 'UNIX'
      : userAgent.indexOf('Linux') !== -1
      ? 'Linux'
      : 'Unknown OS';
  const hashInput = userAgent + platform;
  const hash = CryptoJS.SHA256(hashInput); // use a cryptographic hash function (e.g. SHA-256) to generate a hash
  return hash;
}
