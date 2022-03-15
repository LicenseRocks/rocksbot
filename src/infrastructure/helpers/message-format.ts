export class MessageFormat {
  public static readonly color = Object.freeze({
    errorRed: 0xfc427b,
    neutralGray: 0x2f3136,
  });

  public static user(id: string): string {
    return `<@!${id}>`;
  }

  public static channel(id: string): string {
    return `<@#${id}>`;
  }

  public static role(id: string): string {
    return `<@&${id}>`;
  }

  public static strike(message: string): string {
    return `~~${message}~~`;
  }

  public static underline(message: string): string {
    return `__${message}__`;
  }

  public static codeMultiline(message: string, lang?: string): string {
    return `\`\`\`${lang || ""}
      ${message}
    \`\`\``;
  }

  public static italic(message: string): string {
    return `*${message}*`;
  }

  public static bold(message: string): string {
    return `**${message}**`;
  }

  public static code(message: string): string {
    return `\`${message}\``;
  }
}
