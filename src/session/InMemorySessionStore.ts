import { ISessionStore } from "./ISessionStore";

type SessionEntry = {
  value: string;
  expiresAt: number | null;
};

export class InMemorySessionStore implements ISessionStore {
  private readonly entries = new Map<string, SessionEntry>();

  async get(key: string): Promise<string | null> {
    const entry = this.entries.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.entries.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key);
  }
}
