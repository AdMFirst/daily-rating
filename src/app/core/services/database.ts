import Dexie, { type EntityTable } from 'dexie';

export interface MoodEntry {
  id?: number;
  date: string;
  valance: number;
  activation: number;
  rating: number;
}

interface MoodRow {
  id?: number;
  date: string;
  encrypted: string;
}

class MoodDatabase extends Dexie {
  mood!: EntityTable<MoodRow, 'id'>;

  constructor() {
    super('MoodDatabase');

    this.version(1).stores({
      mood: '++id, date'
    });
  }
}

class DatabaseService {
  private db = new MoodDatabase();
  private cryptoKey: CryptoKey | null = null;

  async unlock(password: string): Promise<void> {
    console.debug('Unlocking database!');
    const keyBytes = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(password)
    );

    this.cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );

    sessionStorage.setItem('mood-db-password', password);
  }

  async restoreSession(): Promise<boolean> {
    const password = sessionStorage.getItem('mood-db-password');
    if (!password) return false;

    await this.unlock(password);
    return true;
  }

  lock(): void {
    this.cryptoKey = null;
    sessionStorage.removeItem('mood-db-password');
  }

  async save(data: Omit<MoodEntry, 'id'>): Promise<number> {
    if (!this.cryptoKey) {
      throw new Error('Database is locked');
    }

    const payload = JSON.stringify({
      valance: data.valance,
      activation: data.activation,
      rating: data.rating
    });

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.cryptoKey,
      new TextEncoder().encode(payload)
    );

    const encrypted = this.combineIvAndCipher(iv, new Uint8Array(encryptedBuffer));

    return this.db.mood.add({
      date: data.date,
      encrypted
    }) as Promise<number>;
  }

  async getAll(): Promise<MoodEntry[]> {
    if (!this.cryptoKey) {
      throw new Error('Database is locked');
    }

    const rows = await this.db.mood.orderBy('date').reverse().toArray();

    return Promise.all(
      rows.map(async (row) => {
        const combined = this.base64ToBytes(row.encrypted);
        const iv = combined.slice(0, 12);
        const cipher = combined.slice(12);

        const decryptedBuffer = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          this.cryptoKey as CryptoKey,
          cipher
        );

        const decrypted = JSON.parse(
          new TextDecoder().decode(decryptedBuffer)
        ) as Pick<MoodEntry, 'valance' | 'activation' | 'rating'>;

        return {
          id: row.id,
          date: row.date,
          valance: decrypted.valance,
          activation: decrypted.activation,
          rating: decrypted.rating
        };
      })
    );
  }

  async clearAll(): Promise<void> {
    await this.db.mood.clear();
  }

  private combineIvAndCipher(iv: Uint8Array, cipher: Uint8Array): string {
    const combined = new Uint8Array(iv.length + cipher.length);
    combined.set(iv, 0);
    combined.set(cipher, iv.length);
    return this.bytesToBase64(combined);
  }

  private bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (const b of bytes) {
      binary += String.fromCharCode(b);
    }
    return btoa(binary);
  }

  private base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  }
}

export const database = new DatabaseService();