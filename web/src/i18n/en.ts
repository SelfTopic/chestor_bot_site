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
    faqKicker: "Questions",
    faqTitle: "FAQ",
  },
  faq: [
    {
      question: "Is there a Tokyo Ghoul bot for Telegram?",
      answer:
        "Yes, CheStor — @chestor_chat_bot. You become a ghoul with a random kagune type, level up your stats, fight mobs and other players in duels, watch your hunger and earn CheSton.",
      slug: "ghoul",
    },
    {
      question: "How do I start playing?",
      answer:
        "Send /start to the bot in private messages and subscribe to @chestor_channel — the game is locked without it. Then type “grow kagune” to become a ghoul and “snap” for your first money.",
      slug: "start",
    },
    {
      question: "Is the bot free?",
      answer:
        "Yes. There is nothing to pay real money for: the whole economy runs on the in-game CheSton currency and RC cells.",
      slug: "economy",
    },
    {
      question: "Can I add the bot to a group?",
      answer:
        "Yes. In a group the whole chat sees the game: duels, chat leaderboards, families. The bot also moderates the group: mute, ban, warnings, welcome message and rules.",
      slug: "moderation",
    },
    {
      question: "What languages does the bot speak?",
      answer:
        "Russian and English. In a group the admins choose the language, in private messages everyone picks their own; until then the bot uses your Telegram language.",
      slug: "start",
    },
    {
      question: "Do commands need a slash?",
      answer:
        "Almost all commands are plain words without a slash: “snap”, “duel”, “drink coffee”. For a short answer about any command, type /help and the command name right in the bot.",
      slug: "start",
    },
  ],
  quiz: {
    kicker: "Quiz",
    title: "Prove you're a ghoul",
    lead: "Tokyo Ghoul lore questions from the same quiz as /quiz in the bot. Tricky on purpose. The questions are in Russian for now.",
    start: "Give me a question",
    next: "Another question",
    statement: "True or false?",
    trueLabel: "True",
    falseLabel: "False",
    correct: "Correct!",
    wrong: "Nope.",
    rightAnswer: "Right answer:",
    streak: (count: number) => `Streak: ${count}`,
    botReward: (multiplier: string) =>
      `In the bot a correct answer pays 5,000–10,000 CheSton, and this streak gives ×${multiplier}.`,
    play: "Play in the bot",
    loading: "Getting a question…",
    fallback: "The question service is down — this is the backup deck.",
    rateLimited: (seconds: number) => `Too fast. Try again in ${seconds}s.`,
    busy: (seconds: number) => `The quiz is overloaded. Try again in ${seconds}s.`,
    failed: "Couldn't get a question. Try again.",
    expired: "That question went stale — here's a new one.",
  },
  seo: {
    gameAltNames: ["Tokyo Ghoul Telegram bot", "Tokyo Ghoul RPG in Telegram", "@chestor_chat_bot"],
    breadcrumbHome: "Home",
    faqMore: "Details",
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
