import { ISessionStore } from "./ISessionStore";

export class RedisSessionStore implements ISessionStore {
  async get(_key: string): Promise<string | null> {
    throw new Error("RedisSessionStore is not configured yet.");
  }

  async set(_key: string, _value: string, _ttlSeconds?: number): Promise<void> {
    throw new Error("RedisSessionStore is not configured yet.");
  }

  async delete(_key: string): Promise<void> {
    throw new Error("RedisSessionStore is not configured yet.");
  }
}
