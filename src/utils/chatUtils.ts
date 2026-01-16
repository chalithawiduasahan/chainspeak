// src/lib/chatUtils.ts

export const TOPICS = [
  { name: "Business", keywords: ["business", "company", "work", "office", "startup", "money", "meeting", "project"] },
  { name: "Health", keywords: ["health", "doctor", "medicine", "hospital", "fitness", "diet", "exercise", "wellness"] },
  { name: "AI", keywords: ["ai", "artificial intelligence", "machine learning", "chatbot", "model", "neural", "algorithm"] },
  { name: "Entertainment", keywords: ["movie", "music", "game", "tv", "show", "concert", "entertainment", "series"] },
  { name: "General", keywords: [] }
];

export function detectTopic(messages: string[]): string {
  const text = messages.join(" ").toLowerCase();
  let bestMatch = "General";
  let maxCount = 0;
  for (const topic of TOPICS) {
    if (topic.name === "General") continue;
    let count = 0;
    for (const keyword of topic.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      count += (text.match(regex) || []).length;
    }
    if (count > maxCount) {
      maxCount = count;
      bestMatch = topic.name;
    }
  }
  return bestMatch;
}

export function generateTitle(messages: string[], topic: string): string {
  if (topic === "General") {
    const firstMsg = messages[0] || "";
    return firstMsg.split(" ").slice(0, 7).join(" ") + (firstMsg.split(" ").length > 7 ? "..." : "");
  } else {
    const firstMsg = messages[0] || "";
    return `${topic}: ${firstMsg.split(" ").slice(0, 7).join(" ")}${firstMsg.split(" ").length > 7 ? "..." : ""}`;
  }
}
