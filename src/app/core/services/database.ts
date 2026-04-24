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

interface MetaRow {
  id: string;
  encrypted: string;
}

export class PasswordWrongError extends Error {}

class MoodDatabase extends Dexie {
  mood!: EntityTable<MoodRow, 'id'>;
  meta!: EntityTable<MetaRow, 'id'>;

  constructor() {
    super('MoodDatabase');

    this.version(1).stores({
      mood: '++id, &date',
      meta: 'id'
    });
  }
}

class DatabaseService {
  private db = new MoodDatabase();
  private cryptoKey: CryptoKey | null = null;

  async unlock(password: string): Promise<void> {
    // 1. Derive the key from the password
    const keyBytes = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(password)
    );

    const tempKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );

    // 2. Validate the key against the Canary
    const canary = await this.db.meta.get('auth_canary');

    if (canary) {
      try {
        // Try to decrypt the canary record
        await this.decryptRaw(canary.encrypted, tempKey);
      } catch (e) {
        // If decryption fails, the password is wrong
        throw new PasswordWrongError('INVALID_PASSWORD');
      }
    } else {
      // First time use: Create the canary
      const encryptedCanary = await this.encryptRaw("verified", tempKey);
      await this.db.meta.put({ id: 'auth_canary', encrypted: encryptedCanary });
    }

    // 3. If we got here, the password is correct!
    this.cryptoKey = tempKey;
    sessionStorage.setItem('mood-db-password', password);
  }

  private async encryptRaw(text: string, key: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    return this.combineIvAndCipher(iv, new Uint8Array(ciphertext));
  }

  private async decryptRaw(base64: string, key: CryptoKey): Promise<string> {
    const combined = this.base64ToBytes(base64);
    const iv = combined.slice(0, 12);
    const cipher = combined.slice(12);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipher
    );
    return new TextDecoder().decode(decryptedBuffer);
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


  /**
   * Seed the database with realistic mood entries for the last three months up to today.
   *
   * - Each day gets on average one entry; a small random chance adds a second or third entry.
   * - `valance` and `activation` are constrained to a circle of radius 0.7 to avoid impossible extremes.
   * - The `rating` (1‑5 stars) is derived from the combined valence/activation so that higher
   *   emotional intensity yields a higher rating.
   */
  async debugSeedData(): Promise<void> {
    if (!this.cryptoKey) {
      throw new Error('Database is locked');
    }

    const now = new Date();
    // Start from the first day of the month three months ago
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    // End at today (inclusive)
    const end = new Date(now);

    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      // Base one entry per day, with a 20% chance of a second and 5% chance of a third
      const extra = this.randomInt(0, 2); // 0‑2 extra entries
      const entriesForDay = 1 + extra;

      for (let i = 0; i < entriesForDay; i++) {
        const entryDate = new Date(day);
        entryDate.setHours(
          this.randomInt(8, 22),
          this.randomInt(0, 59),
          this.randomInt(0, 59),
          0
        );

        // Generate valance and activation within a circle of radius 0.7
        const { valance, activation } = this.randomValanceActivation();

        // Derive rating from the magnitude of the emotional vector (0‑0.7)
        const rating = this.ratingFromEmotion(valance, activation);

        await this.save({
          date: entryDate.toISOString(),
          valance,
          activation,
          rating
        });
      }
    }
  }

  /** Generate a valance/activation pair whose Euclidean distance from (0,0) does not exceed 0.7 */
  private randomValanceActivation(): { valance: number; activation: number } {
    const radius = 0.7;
    // Polar coordinates: random angle, random radius (sqrt for uniform distribution)
    const angle = Math.random() * 2 * Math.PI;
    const r = Math.sqrt(Math.random()) * radius;
    const valance = r * Math.cos(angle);
    const activation = r * Math.sin(angle);
    return { valance, activation };
  }

  /** Convert emotional intensity to a 1‑5 star rating. */
  private ratingFromEmotion(valance: number, activation: number): number {
    const magnitude = Math.sqrt(valance * valance + activation * activation);
    // Map magnitude 0‑0.7 to rating 1‑5
    const rating = Math.round((magnitude / 0.7) * 4) + 1;
    return Math.min(Math.max(rating, 1), 5);
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}

export const database = new DatabaseService();
