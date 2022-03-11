import { stripIndent } from "common-tags";

import { MessageFormat } from "@infrastructure/helpers/message-format";

export const welcomeMessages = {
  en: {
    title: "🇬🇧 Hey! I'm RocksBot",
    description: stripIndent`
      I'm an ${MessageFormat.bold(
        "integration layer"
      )} between ${MessageFormat.bold(
      "CreatorsHub"
    )} and your safe place to talk.

      Since you're the owner, I'm sending some basic instructions regarding getting started using me ${MessageFormat.italic(
        "(there are only a few uncomplicated things for you to do)"
      )}.
    `,
    fields: [
      {
        name: "Verifying & connecting to the CreatorsHub",
        value: stripIndent`In order to prevent spam and malicious usage, there is user friendly mechanism that ensures us that nothing wrong is going on.

          To start the verification, please navigate to any channel where bot has permissions to view messages, type ${MessageFormat.code(
            "/verify"
          )} and follow further instructions. If anything seems unclear - [read more about integration process here](https://docs.license.rocks/rocksbot) 

          ${MessageFormat.italic(
            "Psst.. while typing a command - an suggestion dialog should pop up (it is really helpful!)"
          )}
        `,
      },
      {
        name: "Additional resources",
        value: stripIndent`[Main page](https://license.rocks/) | [Documentation](https://docs.license.rocks/)`,
      },
    ],
    footer: "Created with 💜 by license.rocks"
  },
  // TODO: Deutsch translations
};
