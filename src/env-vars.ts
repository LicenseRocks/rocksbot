type EnvironmentModeType = "development" | "production";

export class EnvVars {
  public static readonly MODE = process.env.NODE_ENV as EnvironmentModeType;
  public static readonly DISCORD_TOKEN: string = process.env.DISCORD_TOKEN;
  public static readonly DISCORD_TEST_GUILD_ID: string =
    process.env.DISCORD_TEST_GUILD_ID;
  public static readonly DISCORD_CLIENT_ID: string =
    process.env.DISCORD_CLIENT_ID;
}
