import { stripIndent } from "common-tags";

import { MessageFormat } from "@infrastructure/helpers/message-format";

export const welcomeMessages = {
  en: {
    authorName: "license.rocks",
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
          )} and follow further instructions. If anything seems unclear - please [read more about integration process here](https://docs.license.rocks/rocksbot/integration) 

          ${MessageFormat.underline("Verification is an one time action")}
        `,
      },
      {
        name: "Updating your server info on CreatorsHub",
        value: stripIndent`We're aware that things like server icon, its name or the roles changes. If you have already connected your server to the CreatorsHub you can actually easily update this info in the Hub itself! 

        All you have to do is type ${MessageFormat.code(
          "/refresh"
        )} and follow on-screen command auto suggestions. If anything seems unclear - please [read more about server info update here](https://docs.license.rocks/rocksbot/server-info-update)
        `,
      },
      {
        name: "Logging & notifications",
        value: stripIndent`RocksBot comes with almost out-of-the-box functionality of logging every action to the Discord channel with delightful messages describing bot's activity.

          In order to enable logging & notifications feature, all you need to do is create channel named ${MessageFormat.code(
            "rocksbot-logs"
          )} ${MessageFormat.italic(
          "(it has to be exactly the same!)"
        )} If you want to fully explore this topic - please [read more about logging here](https://docs.license.rocks/rocksbot/logging)
        `,
      },
      {
        name: "Additional resources",
        value: stripIndent`[Main page](https://license.rocks/) | [Documentation](https://docs.license.rocks/)`,
      },
    ],
    footer: "Created with 💜 by license.rocks",
  },
  // TODO: Deutsch translations
};
