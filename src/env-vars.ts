type EnvironmentModeType = "development" | "production";

export class EnvVars {
  public static readonly MODE = process.env.NODE_ENV as EnvironmentModeType;
  public static readonly DISCORD_TOKEN: string = process.env.DISCORD_TOKEN;
  public static readonly DISCORD_TEST_GUILD_ID: string =
    process.env.DISCORD_TEST_GUILD_ID;
  public static readonly DISCORD_CLIENT_ID: string =
    process.env.DISCORD_CLIENT_ID;
  public static readonly REDIS_PORT: string = process.env.REDIS_PORT;
  public static readonly REDIS_HOST: string = process.env.REDIS_HOST;
  public static readonly REDIS_DB_NO: string = process.env.REDIS_DB_NO;
}
