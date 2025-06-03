export type LinearItem = {
  title: string;
  description?: string;
  project?: string;
};

export class LinearReturn {
  todo: Array<LinearItem>;
  backlog: Array<LinearItem>;

  constructor() {
    this.todo = [];
    this.backlog = [];
  }
}

export type CacheEndpointRequest = {
  action: CacheAction;
};

export type CacheAction = "refresh" | "clear";

export interface KV {
  get(key: string): Promise<LinearReturn | undefined>;
  set(key: string, value: LinearReturn, ttl: number): Promise<void>;
  clear(key: string): Promise<void>;
  close(): void;
}

export class DenoKV implements KV {
  private kv: Deno.Kv;

  constructor(kv: Deno.Kv) {
    this.kv = kv;
  }

  /**
   * Retrieves a LinearReturn object from the KV store
   * @param key - The key to retrieve
   * @returns Promise<LinearReturn> - The stored LinearReturn object or a new empty one
   */
  async get(key: string): Promise<LinearReturn | undefined> {
    try {
      const result = await this.kv.get([key]);

      if (result?.value) {
        const data = result.value as LinearReturn;
        // Ensure the returned object has the correct structure
        const linearReturn = new LinearReturn();
        linearReturn.todo = Array.isArray(data.todo) ? data.todo : [];
        linearReturn.backlog = Array.isArray(data.backlog) ? data.backlog : [];
        return linearReturn;
      }

      // Return empty LinearReturn if no data found
      return undefined;
    } catch (error) {
      console.error(`Failed to get key "${key}" from KV store:`, error);
      return undefined;
    }
  }

  /**
   * Stores a LinearReturn object in the KV store
   * @param key - The key to store the value under
   * @param value - The LinearReturn object to store
   */
  async set(key: string, value: LinearReturn, ttl: number): Promise<void> {
    try {
      await this.kv.set([key], value, { expireIn: ttl });
    } catch (error) {
      console.error(`Failed to set key "${key}" in KV store:`, error);
      throw error;
    }
  }

  /**
   * Removes a key from the KV store
   * @param key - The key to remove
   */
  async clear(key: string): Promise<void> {
    try {
      await this.kv.delete([key]);
    } catch (error) {
      console.error(`Failed to clear key "${key}" from KV store:`, error);
      throw error;
    }
  }

  /**
   * Closes the KV connection
   */
  close(): void {
    this.kv.close();
  }
}
