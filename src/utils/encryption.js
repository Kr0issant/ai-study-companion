import CryptoJS from 'crypto-js';

/**
 * Generates a unique encryption key by combining the user's UID 
 * and environment-defined salts.
 */
const getEncryptionKey = (uid) => {
    const pepper = import.meta.env.VITE_PEPPER;
    const herbs = import.meta.env.VITE_HERBS;
    return `${uid}${pepper}${herbs}`;
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
