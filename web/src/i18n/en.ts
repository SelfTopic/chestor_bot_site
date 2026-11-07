import type { Dict } from "./index";

export const en: Dict = {
  langName: "English",
  meta: {
    title: "CheStor — a Tokyo Ghoul bot for Telegram",
    description:
      "A Tokyo Ghoul Telegram bot: become a ghoul, grow your kagune, fight duels, earn CheSton. Plus chat moderation, and videos and music from links right in the chat.",
  },
  nav: { home: "CheStor", docs: "Docs", switchLang: "Русский", switchLangLabel: "Переключить на русский" },
  theme: { toGhoul: "Awaken the kakugan", toHuman: "Back to human form" },
  home: {
    kicker: "Telegram bot",
    title: "CheStor",
    lead: "A Tokyo Ghoul game right in your chat: become a ghoul, grow your kagune, fight and survive. The bot also moderates the chat, fetches videos and music from links, and snaps back if you poke it.",
    play: "Play in Telegram",
    addToGroup: "Add to a group",
    docs: "Docs",
    sectionsKicker: "What the bot does",
    sectionsTitle: "It's all in the docs",
  },
  docs: {
    kicker: "Docs",
    title: "Everything the bot can do",
    lead: "Every command with examples, cooldowns and rewards. Almost all commands are plain words, no slash.",
    sections: "Sections",
    onPage: "Commands and mechanics",
    inBot: "Short answer right in the bot",
    channel: "Docs channel",
    prev: "Back",
    next: "Next",
    allSections: "All sections",
    topicsMore: (count: number) => `and ${count} more`,
  },
  footer: { source: "The docs come from the bot's repository", builtBy: "How the bot is built" },
};
