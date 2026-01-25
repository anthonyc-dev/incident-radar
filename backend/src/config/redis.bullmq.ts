import Redis from "ioredis";
import type { Redis as RedisType } from "ioredis";

let bullRedis: RedisType;

try {

  const redisUrl = process.env.REDIS_URL;
  let connectionConfig: string | any;

  if (redisUrl) {

    connectionConfig = redisUrl;
  } else {
    // Build connection options from environment variables
    const host = process.env.REDIS_HOST || "127.0.0.1";
    const port = parseInt(process.env.REDIS_PORT || "6379", 10);
    const password = process.env.REDIS_PASSWORD || "anthony";

    connectionConfig = {
      host,
      port,
      password,
      maxRetriesPerRequest: null,
    };
  }


  // ioredis accepts either a URL string or options object
  bullRedis = new (Redis as any)(connectionConfig);

  // Only add maxRetriesPerRequest if not already in connectionConfig (when using URL)
  if (typeof connectionConfig === "string") {
    bullRedis.options.maxRetriesPerRequest = null;
  }

  bullRedis.on("error", (err: Error) => {
    console.error("Bull Redis connection error:", err);
  });

  bullRedis.on("connect", () => {
    console.log("Bull Redis connected");
  });
} catch (error) {
  console.error("Failed to initialize Bull Redis:", error);
  throw error;
}

export { bullRedis };
