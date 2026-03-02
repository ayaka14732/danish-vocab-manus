// Danish Vocabulary Database
// Design: Academic Elegance — dark forest green bg, parchment cards, gold accents

export type WordCategory =
  | "basics"
  | "numbers"
  | "colors"
  | "food"
  | "family"
  | "body"
  | "nature"
  | "travel"
  | "time"
  | "phrases";

export interface VocabWord {
  id: string;
  danish: string;
  chinese: string;
  english: string;
  pronunciation: string; // IPA or phonetic hint
  example?: string; // Danish example sentence
  exampleChinese?: string;
  category: WordCategory;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags?: string[];
}

export const CATEGORIES: Record<WordCategory, { label: string; icon: string; color: string }> = {
  basics: { label: "基礎詞彙", icon: "📖", color: "#C9A84C" },
  numbers: { label: "數字", icon: "🔢", color: "#7B9E87" },
  colors: { label: "顏色", icon: "🎨", color: "#A67B5B" },
  food: { label: "食物", icon: "🍽️", color: "#C17F5A" },
  family: { label: "家庭", icon: "👨‍👩‍👧", color: "#8B7355" },
  body: { label: "身體", icon: "🫀", color: "#9B8EA0" },
  nature: { label: "自然", icon: "🌿", color: "#5A7A5A" },
  travel: { label: "旅行", icon: "✈️", color: "#4A7A9B" },
  time: { label: "時間", icon: "⏰", color: "#8B6B4A" },
  phrases: { label: "常用語", icon: "💬", color: "#6B8B6B" },
};

export const VOCABULARY: VocabWord[] = [
  // === BASICS ===
  {
    id: "b001",
    danish: "hej",
    chinese: "你好",
    english: "hello",
    pronunciation: "hi",
    example: "Hej! Hvordan har du det?",
    exampleChinese: "你好！你好嗎？",
    category: "basics",
    difficulty: "beginner",
    tags: ["greeting"],
  },
  {
    id: "b002",
    danish: "tak",
    chinese: "謝謝",
    english: "thank you",
    pronunciation: "tag",
    example: "Mange tak for hjælpen.",
    exampleChinese: "非常感謝你的幫助。",
    category: "basics",
    difficulty: "beginner",
    tags: ["polite"],
  },
  {
    id: "b003",
    danish: "ja",
    chinese: "是",
    english: "yes",
    pronunciation: "ya",
    example: "Ja, det er rigtigt.",
    exampleChinese: "是的，那是正確的。",
    category: "basics",
    difficulty: "beginner",
  },
  {
    id: "b004",
    danish: "nej",
    chinese: "不",
    english: "no",
    pronunciation: "nai",
    example: "Nej, det kan jeg ikke.",
    exampleChinese: "不，我做不到。",
    category: "basics",
    difficulty: "beginner",
  },
  {
    id: "b005",
    danish: "undskyld",
    chinese: "對不起",
    english: "sorry / excuse me",
    pronunciation: "un-sgul",
    example: "Undskyld, må jeg komme forbi?",
    exampleChinese: "對不起，我可以過去嗎？",
    category: "basics",
    difficulty: "beginner",
    tags: ["polite"],
  },
  {
    id: "b006",
    danish: "farvel",
    chinese: "再見",
    english: "goodbye",
    pronunciation: "far-vel",
    example: "Farvel og på gensyn!",
    exampleChinese: "再見，回頭見！",
    category: "basics",
    difficulty: "beginner",
    tags: ["greeting"],
  },
  {
    id: "b007",
    danish: "vand",
    chinese: "水",
    english: "water",
    pronunciation: "van",
    example: "Kan jeg få et glas vand?",
    exampleChinese: "我可以要一杯水嗎？",
    category: "basics",
    difficulty: "beginner",
  },
  {
    id: "b008",
    danish: "hus",
    chinese: "房子",
    english: "house",
    pronunciation: "hoos",
    example: "Det er et stort hus.",
    exampleChinese: "那是一棟大房子。",
    category: "basics",
    difficulty: "beginner",
  },
  {
    id: "b009",
    danish: "mand",
    chinese: "男人",
    english: "man",
    pronunciation: "man",
    example: "Manden læser en bog.",
    exampleChinese: "那個男人在讀書。",
    category: "basics",
    difficulty: "beginner",
  },
  {
    id: "b010",
    danish: "kvinde",
    chinese: "女人",
    english: "woman",
    pronunciation: "kvin-uh",
    example: "Kvinden taler dansk.",
    exampleChinese: "那個女人說丹麥語。",
    category: "basics",
    difficulty: "beginner",
  },
  {
    id: "b011",
    danish: "bog",
    chinese: "書",
    english: "book",
    pronunciation: "boh",
    example: "Jeg læser en god bog.",
    exampleChinese: "我在讀一本好書。",
    category: "basics",
    difficulty: "beginner",
  },
  {
    id: "b012",
    danish: "bil",
    chinese: "汽車",
    english: "car",
    pronunciation: "beel",
    example: "Min bil er rød.",
    exampleChinese: "我的車是紅色的。",
    category: "basics",
    difficulty: "beginner",
  },
  // === NUMBERS ===
  {
    id: "n001",
    danish: "en / et",
    chinese: "一",
    english: "one",
    pronunciation: "en / et",
    example: "Jeg har en hund.",
    exampleChinese: "我有一隻狗。",
    category: "numbers",
    difficulty: "beginner",
  },
  {
    id: "n002",
    danish: "to",
    chinese: "二",
    english: "two",
    pronunciation: "toh",
    example: "Der er to æbler.",
    exampleChinese: "有兩個蘋果。",
    category: "numbers",
    difficulty: "beginner",
  },
  {
    id: "n003",
    danish: "tre",
    chinese: "三",
    english: "three",
    pronunciation: "treh",
    example: "Tre børn leger i parken.",
    exampleChinese: "三個孩子在公園玩耍。",
    category: "numbers",
    difficulty: "beginner",
  },
  {
    id: "n004",
    danish: "fire",
    chinese: "四",
    english: "four",
    pronunciation: "fee-ruh",
    example: "Katten har fire ben.",
    exampleChinese: "貓有四條腿。",
    category: "numbers",
    difficulty: "beginner",
  },
  {
    id: "n005",
    danish: "fem",
    chinese: "五",
    english: "five",
    pronunciation: "fem",
    example: "Jeg er fem år gammel.",
    exampleChinese: "我五歲了。",
    category: "numbers",
    difficulty: "beginner",
  },
  {
    id: "n006",
    danish: "seks",
    chinese: "六",
    english: "six",
    pronunciation: "sex",
    example: "Der er seks dage tilbage.",
    exampleChinese: "還有六天。",
    category: "numbers",
    difficulty: "beginner",
  },
  {
    id: "n007",
    danish: "syv",
    chinese: "七",
    english: "seven",
    pronunciation: "syoo",
    example: "Ugen har syv dage.",
    exampleChinese: "一週有七天。",
    category: "numbers",
    difficulty: "beginner",
  },
  {
    id: "n008",
    danish: "otte",
    chinese: "八",
    english: "eight",
    pronunciation: "oh-duh",
    example: "Der er otte planeter.",
    exampleChinese: "有八顆行星。",
    category: "numbers",
    difficulty: "beginner",
  },
  {
    id: "n009",
    danish: "ni",
    chinese: "九",
    english: "nine",
    pronunciation: "nee",
    example: "Ni minus tre er seks.",
    exampleChinese: "九減三等於六。",
    category: "numbers",
    difficulty: "beginner",
  },
  {
    id: "n010",
    danish: "ti",
    chinese: "十",
    english: "ten",
    pronunciation: "tee",
    example: "Jeg har ti fingre.",
    exampleChinese: "我有十根手指。",
    category: "numbers",
    difficulty: "beginner",
  },
  // === COLORS ===
  {
    id: "c001",
    danish: "rød",
    chinese: "紅色",
    english: "red",
    pronunciation: "ruh",
    example: "Dannebrog er rød og hvid.",
    exampleChinese: "丹麥國旗是紅白相間的。",
    category: "colors",
    difficulty: "beginner",
  },
  {
    id: "c002",
    danish: "blå",
    chinese: "藍色",
    english: "blue",
    pronunciation: "blaw",
    example: "Himlen er blå i dag.",
    exampleChinese: "今天天空是藍色的。",
    category: "colors",
    difficulty: "beginner",
  },
  {
    id: "c003",
    danish: "grøn",
    chinese: "綠色",
    english: "green",
    pronunciation: "groon",
    example: "Græsset er grønt.",
    exampleChinese: "草是綠色的。",
    category: "colors",
    difficulty: "beginner",
  },
  {
    id: "c004",
    danish: "hvid",
    chinese: "白色",
    english: "white",
    pronunciation: "vee",
    example: "Sneen er hvid.",
    exampleChinese: "雪是白色的。",
    category: "colors",
    difficulty: "beginner",
  },
  {
    id: "c005",
    danish: "sort",
    chinese: "黑色",
    english: "black",
    pronunciation: "sort",
    example: "Katten er sort.",
    exampleChinese: "那隻貓是黑色的。",
    category: "colors",
    difficulty: "beginner",
  },
  {
    id: "c006",
    danish: "gul",
    chinese: "黃色",
    english: "yellow",
    pronunciation: "gool",
    example: "Solen er gul.",
    exampleChinese: "太陽是黃色的。",
    category: "colors",
    difficulty: "beginner",
  },
  // === FOOD ===
  {
    id: "f001",
    danish: "brød",
    chinese: "麵包",
    english: "bread",
    pronunciation: "bruh",
    example: "Jeg spiser rugbrød til frokost.",
    exampleChinese: "我午餐吃黑麥麵包。",
    category: "food",
    difficulty: "beginner",
  },
  {
    id: "f002",
    danish: "smørrebrød",
    chinese: "丹麥開放式三明治",
    english: "open sandwich",
    pronunciation: "smur-bruh",
    example: "Smørrebrød er en dansk tradition.",
    exampleChinese: "丹麥開放式三明治是丹麥傳統。",
    category: "food",
    difficulty: "intermediate",
  },
  {
    id: "f003",
    danish: "mælk",
    chinese: "牛奶",
    english: "milk",
    pronunciation: "melk",
    example: "Børn drikker meget mælk.",
    exampleChinese: "孩子們喝很多牛奶。",
    category: "food",
    difficulty: "beginner",
  },
  {
    id: "f004",
    danish: "kaffe",
    chinese: "咖啡",
    english: "coffee",
    pronunciation: "kaf-uh",
    example: "Danskerne elsker kaffe.",
    exampleChinese: "丹麥人喜愛咖啡。",
    category: "food",
    difficulty: "beginner",
  },
  {
    id: "f005",
    danish: "æble",
    chinese: "蘋果",
    english: "apple",
    pronunciation: "eb-luh",
    example: "Et æble om dagen holder lægen væk.",
    exampleChinese: "每天一顆蘋果，醫生遠離我。",
    category: "food",
    difficulty: "beginner",
  },
  {
    id: "f006",
    danish: "fisk",
    chinese: "魚",
    english: "fish",
    pronunciation: "fesk",
    example: "Vi spiser fisk om fredagen.",
    exampleChinese: "我們週五吃魚。",
    category: "food",
    difficulty: "beginner",
  },
  {
    id: "f007",
    danish: "wienerbrød",
    chinese: "丹麥酥皮糕點",
    english: "Danish pastry",
    pronunciation: "vee-ner-bruh",
    example: "Wienerbrød er meget populært i Danmark.",
    exampleChinese: "丹麥酥皮糕點在丹麥非常受歡迎。",
    category: "food",
    difficulty: "intermediate",
  },
  // === FAMILY ===
  {
    id: "fa001",
    danish: "mor",
    chinese: "媽媽",
    english: "mother",
    pronunciation: "mor",
    example: "Min mor hedder Anna.",
    exampleChinese: "我媽媽叫安娜。",
    category: "family",
    difficulty: "beginner",
  },
  {
    id: "fa002",
    danish: "far",
    chinese: "爸爸",
    english: "father",
    pronunciation: "far",
    example: "Min far arbejder som læge.",
    exampleChinese: "我爸爸是醫生。",
    category: "family",
    difficulty: "beginner",
  },
  {
    id: "fa003",
    danish: "søster",
    chinese: "姐妹",
    english: "sister",
    pronunciation: "sus-ter",
    example: "Jeg har en yngre søster.",
    exampleChinese: "我有一個妹妹。",
    category: "family",
    difficulty: "beginner",
  },
  {
    id: "fa004",
    danish: "bror",
    chinese: "兄弟",
    english: "brother",
    pronunciation: "bror",
    example: "Min bror bor i København.",
    exampleChinese: "我哥哥住在哥本哈根。",
    category: "family",
    difficulty: "beginner",
  },
  {
    id: "fa005",
    danish: "barn",
    chinese: "孩子",
    english: "child",
    pronunciation: "barn",
    example: "Barnet leger i haven.",
    exampleChinese: "孩子在花園裡玩耍。",
    category: "family",
    difficulty: "beginner",
  },
  // === NATURE ===
  {
    id: "na001",
    danish: "skov",
    chinese: "森林",
    english: "forest",
    pronunciation: "sgow",
    example: "Vi gik en tur i skoven.",
    exampleChinese: "我們在森林裡散步。",
    category: "nature",
    difficulty: "beginner",
  },
  {
    id: "na002",
    danish: "hav",
    chinese: "大海",
    english: "sea / ocean",
    pronunciation: "haw",
    example: "Danmark er omgivet af hav.",
    exampleChinese: "丹麥被大海環繞。",
    category: "nature",
    difficulty: "beginner",
  },
  {
    id: "na003",
    danish: "sne",
    chinese: "雪",
    english: "snow",
    pronunciation: "sneh",
    example: "Det sner om vinteren.",
    exampleChinese: "冬天會下雪。",
    category: "nature",
    difficulty: "beginner",
  },
  {
    id: "na004",
    danish: "blomst",
    chinese: "花",
    english: "flower",
    pronunciation: "blomst",
    example: "Blomsten dufter dejligt.",
    exampleChinese: "這朵花聞起來很香。",
    category: "nature",
    difficulty: "beginner",
  },
  {
    id: "na005",
    danish: "sol",
    chinese: "太陽",
    english: "sun",
    pronunciation: "sol",
    example: "Solen skinner i dag.",
    exampleChinese: "今天陽光燦爛。",
    category: "nature",
    difficulty: "beginner",
  },
  // === TRAVEL ===
  {
    id: "t001",
    danish: "tog",
    chinese: "火車",
    english: "train",
    pronunciation: "toh",
    example: "Toget afgår klokken otte.",
    exampleChinese: "火車八點出發。",
    category: "travel",
    difficulty: "beginner",
  },
  {
    id: "t002",
    danish: "lufthavn",
    chinese: "機場",
    english: "airport",
    pronunciation: "luft-hown",
    example: "Kastrup er Danmarks største lufthavn.",
    exampleChinese: "卡斯特魯普是丹麥最大的機場。",
    category: "travel",
    difficulty: "intermediate",
  },
  {
    id: "t003",
    danish: "hotel",
    chinese: "飯店",
    english: "hotel",
    pronunciation: "hoh-tel",
    example: "Vi bor på et hotel i centrum.",
    exampleChinese: "我們住在市中心的飯店。",
    category: "travel",
    difficulty: "beginner",
  },
  {
    id: "t004",
    danish: "kort",
    chinese: "地圖",
    english: "map",
    pronunciation: "kort",
    example: "Har du et kort over byen?",
    exampleChinese: "你有城市地圖嗎？",
    category: "travel",
    difficulty: "beginner",
  },
  {
    id: "t005",
    danish: "billet",
    chinese: "票",
    english: "ticket",
    pronunciation: "bi-let",
    example: "Jeg vil gerne købe en billet.",
    exampleChinese: "我想買一張票。",
    category: "travel",
    difficulty: "beginner",
  },
  // === TIME ===
  {
    id: "ti001",
    danish: "dag",
    chinese: "天 / 白天",
    english: "day",
    pronunciation: "dah",
    example: "God dag!",
    exampleChinese: "你好！（白天問候）",
    category: "time",
    difficulty: "beginner",
  },
  {
    id: "ti002",
    danish: "uge",
    chinese: "週",
    english: "week",
    pronunciation: "oo-uh",
    example: "Jeg arbejder fem dage om ugen.",
    exampleChinese: "我每週工作五天。",
    category: "time",
    difficulty: "beginner",
  },
  {
    id: "ti003",
    danish: "måned",
    chinese: "月",
    english: "month",
    pronunciation: "maw-neth",
    example: "December er årets sidste måned.",
    exampleChinese: "十二月是一年的最後一個月。",
    category: "time",
    difficulty: "beginner",
  },
  {
    id: "ti004",
    danish: "år",
    chinese: "年",
    english: "year",
    pronunciation: "or",
    example: "Godt nytår!",
    exampleChinese: "新年快樂！",
    category: "time",
    difficulty: "beginner",
  },
  {
    id: "ti005",
    danish: "morgen",
    chinese: "早晨",
    english: "morning",
    pronunciation: "mor-en",
    example: "God morgen!",
    exampleChinese: "早上好！",
    category: "time",
    difficulty: "beginner",
    tags: ["greeting"],
  },
  {
    id: "ti006",
    danish: "aften",
    chinese: "傍晚 / 晚上",
    english: "evening",
    pronunciation: "af-ten",
    example: "God aften!",
    exampleChinese: "晚上好！",
    category: "time",
    difficulty: "beginner",
    tags: ["greeting"],
  },
  // === BODY ===
  {
    id: "bo001",
    danish: "hoved",
    chinese: "頭",
    english: "head",
    pronunciation: "how-eth",
    example: "Mit hoved gør ondt.",
    exampleChinese: "我頭痛。",
    category: "body",
    difficulty: "beginner",
  },
  {
    id: "bo002",
    danish: "øje",
    chinese: "眼睛",
    english: "eye",
    pronunciation: "oi-uh",
    example: "Hun har blå øjne.",
    exampleChinese: "她有藍色的眼睛。",
    category: "body",
    difficulty: "beginner",
  },
  {
    id: "bo003",
    danish: "hånd",
    chinese: "手",
    english: "hand",
    pronunciation: "hon",
    example: "Giv mig din hånd.",
    exampleChinese: "給我你的手。",
    category: "body",
    difficulty: "beginner",
  },
  {
    id: "bo004",
    danish: "ben",
    chinese: "腿 / 腳",
    english: "leg / foot",
    pronunciation: "ben",
    example: "Han har lange ben.",
    exampleChinese: "他有很長的腿。",
    category: "body",
    difficulty: "beginner",
  },
  {
    id: "bo005",
    danish: "hjerte",
    chinese: "心臟 / 心",
    english: "heart",
    pronunciation: "yer-duh",
    example: "Mit hjerte banker hurtigt.",
    exampleChinese: "我的心臟跳得很快。",
    category: "body",
    difficulty: "beginner",
  },
  {
    id: "bo006",
    danish: "mund",
    chinese: "嘴巴",
    english: "mouth",
    pronunciation: "moon",
    example: "Åbn munden.",
    exampleChinese: "張開嘴巴。",
    category: "body",
    difficulty: "beginner",
  },
  // === PHRASES ===
  {
    id: "p001",
    danish: "Hvad hedder du?",
    chinese: "你叫什麼名字？",
    english: "What is your name?",
    pronunciation: "va heth-er doo",
    example: "Hvad hedder du? — Jeg hedder Lars.",
    exampleChinese: "你叫什麼名字？—我叫拉斯。",
    category: "phrases",
    difficulty: "beginner",
  },
  {
    id: "p002",
    danish: "Jeg forstår ikke",
    chinese: "我不明白",
    english: "I don't understand",
    pronunciation: "yai for-stor ee-guh",
    example: "Undskyld, jeg forstår ikke dansk endnu.",
    exampleChinese: "對不起，我還不懂丹麥語。",
    category: "phrases",
    difficulty: "beginner",
  },
  {
    id: "p003",
    danish: "Kan du hjælpe mig?",
    chinese: "你能幫助我嗎？",
    english: "Can you help me?",
    pronunciation: "kan doo yel-buh mai",
    example: "Undskyld, kan du hjælpe mig?",
    exampleChinese: "對不起，你能幫助我嗎？",
    category: "phrases",
    difficulty: "beginner",
  },
  {
    id: "p004",
    danish: "Hygge",
    chinese: "舒適愜意的氛圍",
    english: "coziness / conviviality",
    pronunciation: "hoo-guh",
    example: "Vi har det hyggeligt her.",
    exampleChinese: "我們在這裡感到非常舒適愜意。",
    category: "phrases",
    difficulty: "intermediate",
    tags: ["culture"],
  },
  {
    id: "p005",
    danish: "Skål!",
    chinese: "乾杯！",
    english: "Cheers!",
    pronunciation: "skawl",
    example: "Skål for venskabet!",
    exampleChinese: "為友誼乾杯！",
    category: "phrases",
    difficulty: "beginner",
    tags: ["culture"],
  },
  {
    id: "p006",
    danish: "Jeg elsker dig",
    chinese: "我愛你",
    english: "I love you",
    pronunciation: "yai el-sger dai",
    example: "Jeg elsker dig meget.",
    exampleChinese: "我非常愛你。",
    category: "phrases",
    difficulty: "beginner",
  },
];

// ── Progress Storage ──────────────────────────────────────────────────────────

export interface WordProgress {
  wordId: string;
  known: boolean;
  reviewCount: number;
  lastReviewed: number; // timestamp
  correctCount: number;
  incorrectCount: number;
}

export interface UserProgress {
  words: Record<string, WordProgress>;
  studyStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  totalReviewed: number;
}

const STORAGE_KEY = "danish_vocab_progress";

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { words: {}, studyStreak: 0, lastStudyDate: "", totalReviewed: 0 };
}

export function saveProgress(progress: UserProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markWord(
  progress: UserProgress,
  wordId: string,
  correct: boolean
): UserProgress {
  const today = new Date().toISOString().split("T")[0];
  const existing = progress.words[wordId] || {
    wordId,
    known: false,
    reviewCount: 0,
    lastReviewed: 0,
    correctCount: 0,
    incorrectCount: 0,
  };

  const updated: WordProgress = {
    ...existing,
    reviewCount: existing.reviewCount + 1,
    lastReviewed: Date.now(),
    correctCount: existing.correctCount + (correct ? 1 : 0),
    incorrectCount: existing.incorrectCount + (correct ? 0 : 1),
    known: correct ? existing.reviewCount >= 1 : false,
  };

  let streak = progress.studyStreak;
  if (progress.lastStudyDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0];
    streak = progress.lastStudyDate === yStr ? streak + 1 : 1;
  }

  return {
    ...progress,
    words: { ...progress.words, [wordId]: updated },
    studyStreak: streak,
    lastStudyDate: today,
    totalReviewed: progress.totalReviewed + 1,
  };
}

export function getStats(progress: UserProgress) {
  const all = VOCABULARY.length;
  const reviewed = Object.keys(progress.words).length;
  const known = Object.values(progress.words).filter((w) => w.known).length;
  const accuracy =
    progress.totalReviewed > 0
      ? Math.round(
          (Object.values(progress.words).reduce((s, w) => s + w.correctCount, 0) /
            progress.totalReviewed) *
            100
        )
      : 0;
  return { all, reviewed, known, accuracy, streak: progress.studyStreak };
}
