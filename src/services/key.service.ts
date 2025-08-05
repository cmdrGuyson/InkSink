export interface EncryptedKey {
  encryptedData: string;
  iv: string;
}

export class KeyService {
  private static readonly STORAGE_PREFIX = "inksink_encrypted_";
  private static readonly MASTER_KEY_NAME = "inksink_master_key";

  /**
   * Generate a master key for encryption/decryption
   */
  private static async generateMasterKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Get or create the master key
   */
  private static async getMasterKey(): Promise<CryptoKey> {
    const storedKey = localStorage.getItem(this.MASTER_KEY_NAME);

    if (storedKey) {
      // Import the stored key
      const keyData = JSON.parse(storedKey);
      return await window.crypto.subtle.importKey(
        "jwk",
        keyData,
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
      );
    } else {
      // Generate a new master key
      const masterKey = await this.generateMasterKey();
      const exportedKey = await window.crypto.subtle.exportKey(
        "jwk",
        masterKey
      );
      localStorage.setItem(this.MASTER_KEY_NAME, JSON.stringify(exportedKey));
      return masterKey;
    }
  }

  /**
   * Encrypt a string value
   */
  static async encrypt(value: string): Promise<EncryptedKey> {
    const masterKey = await this.getMasterKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(value);

    // Generate a random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      masterKey,
      data
    );

    // Convert to base64 strings for storage
    const encryptedData = btoa(
      String.fromCharCode(...new Uint8Array(encryptedBuffer))
    );
    const ivString = btoa(String.fromCharCode(...iv));

    return {
      encryptedData,
      iv: ivString,
    };
  }

  /**
   * Decrypt an encrypted value
   */
  static async decrypt(encryptedKey: EncryptedKey): Promise<string> {
    const masterKey = await this.getMasterKey();

    // Convert from base64 strings back to buffers
    const encryptedData = Uint8Array.from(
      atob(encryptedKey.encryptedData),
      (c) => c.charCodeAt(0)
    );
    const iv = Uint8Array.from(atob(encryptedKey.iv), (c) => c.charCodeAt(0));

    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      masterKey,
      encryptedData
    );

    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  /**
   * Save an encrypted key to localStorage
   */
  static async saveKey(keyName: string, value: string): Promise<void> {
    const encrypted = await this.encrypt(value);
    const storageKey = this.STORAGE_PREFIX + keyName;
    localStorage.setItem(storageKey, JSON.stringify(encrypted));
  }

  /**
   * Load and decrypt a key from localStorage
   */
  static async loadKey(keyName: string): Promise<string | null> {
    const storageKey = this.STORAGE_PREFIX + keyName;
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return null;
    }

    try {
      const encryptedKey: EncryptedKey = JSON.parse(stored);
      return await this.decrypt(encryptedKey);
    } catch (error) {
      console.error("Failed to decrypt key:", error);
      return null;
    }
  }

  /**
   * Delete a key from localStorage
   */
  static deleteKey(keyName: string): void {
    const storageKey = this.STORAGE_PREFIX + keyName;
    localStorage.removeItem(storageKey);
  }

  /**
   * Check if a key exists in localStorage
   */
  static hasKey(keyName: string): boolean {
    const storageKey = this.STORAGE_PREFIX + keyName;
    return localStorage.getItem(storageKey) !== null;
  }

  /**
   * Clear all encrypted keys
   */
  static clearAllKeys(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    // Also clear the master key
    localStorage.removeItem(this.MASTER_KEY_NAME);
  }
}
