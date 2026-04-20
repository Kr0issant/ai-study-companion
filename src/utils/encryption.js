import CryptoJS from 'crypto-js';

/**
 * Generates a unique encryption key by combining the user's UID 
 * and environment-defined salts.
 */
const getEncryptionKey = (uid) => {
    // Immediately mix the environment variables into a SHA256 hash
    // so the final key used for AES isn't just naked string concatenation.
    const p1 = import.meta.env.VITE_PEPPER;
    const p2 = import.meta.env.VITE_HERBS;
    
    // Mix them up in a non-obvious pattern
    const rawMaterial = `${p2}[-:-]${uid}[-:-]${p1}`;
    
    // Return a hex-encoded SHA256 hash to act as the actual AES key
    return CryptoJS.SHA256(rawMaterial).toString(CryptoJS.enc.Hex);
};

/**
 * Encrypts a plaintext string using AES.
 * @param {string} text - The plaintext to encrypt.
 * @param {string} uid - The current user's UID.
 * @returns {string} The AES ciphertext.
 */
export const encryptText = (text, uid) => {
    if (!text || !uid) return text;
    try {
        return CryptoJS.AES.encrypt(text, getEncryptionKey(uid)).toString();
    } catch (error) {
        console.error("Encryption failed", error);
        return text;
    }
};

/**
 * Decrypts an AES ciphertext string. Includes a fallback to return 
 * the original string if it wasn't encrypted (useful for migration).
 * @param {string} ciphertext - The ciphertext to decrypt.
 * @param {string} uid - The current user's UID.
 * @returns {string} The plaintext string.
 */
export const decryptText = (ciphertext, uid) => {
    if (!ciphertext || !uid) return ciphertext;
    
    // CryptoJS AES-encrypted outputs typically start with 'U2FsdGVkX1' (Base64 for 'Salted__')
    if (ciphertext.startsWith('U2FsdGVkX1')) {
        try {
            const bytes = CryptoJS.AES.decrypt(ciphertext, getEncryptionKey(uid));
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            return originalText || ciphertext;
        } catch (error) {
            console.error("Decryption failed. Could be an invalid key or corrupted data.", error);
            return ciphertext;
        }
    }
    
    // Fallback: If it doesn't look like our ciphertext, return it as-is.
    return ciphertext;
};
