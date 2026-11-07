import { JetBrains_Mono, Onest, Unbounded } from "next/font/google";

// next/font скачивает шрифты при сборке и раздаёт их со своего домена — без запросов к Google.
const onest = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-onest", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-jetbrains", display: "swap" });
const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  weight: ["600", "800"],
  display: "swap",
});

export const fontVariables = `${onest.variable} ${jetbrains.variable} ${unbounded.variable}`;
