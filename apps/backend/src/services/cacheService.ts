import { config } from "@/config/environment";
import { logger } from "@/utils/logger";
import { createClient, RedisClientType } from "redis";

class CacheService {
  private client: RedisClientType | null = null;
  private connected: boolean = false;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      this.client = createClient({
        url: config.redisUrl,
      });

      this.client.on("error", (err) => {
        logger.error("Redis Client Error", { error: err });
        this.connected = false;
      });

      this.client.on("connect", () => {
        logger.info("Redis Client Connected");
        this.connected = true;
      });

      this.client.on("disconnect", () => {
        logger.warn("Redis Client Disconnected");
        this.connected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error("Failed to initialize Redis client", { error });
      this.connected = false;
    }
  }

  async get(key: string): Promise<any | null> {
    if (!this.connected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error("Cache get error", { key, error });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);

      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }

      return true;
    } catch (error) {
      logger.error("Cache set error", { key, error });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error("Cache delete error", { key, error });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error("Cache exists error", { key, error });
      return false;
    }
  }

  async flush(): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.error("Cache flush error", { error });
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.connected = false;
    }
  }
}

export const cacheService = new CacheService();
