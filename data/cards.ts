export type Faction = "pokemon" | "melody";

export interface DuelCard {
  id: string;
  faction: Faction;
  title: string;
  subtitle: string;
  styleLabel: string;
  score: number;
  command: string;
  isComingSoon?: boolean;
}

const POSITIVE_MESSAGES = [
  "Lucky draw! Keep shining ✨",
  "Great momentum, keep going!",
  "Perfect timing, team power up!",
  "Nice combo! Momentum unlocked.",
  "You earned this boost, champion!",
  "今天狀態超好，繼續衝！",
  "Bravo! Your strategy paid off.",
  "信心加倍，節奏到位！",
];

const NEGATIVE_MESSAGES = [
  "別灰心，下一張會翻盤。",
  "Take a breath, comeback starts now.",
  "小失誤而已，繼續專注。",
  "Oops! Stay calm and fight back.",
  "這回合不順，但你還有機會！",
  "Don’t tilt, next move wins.",
  "先忍住，下一手反擊。",
  "Keep your chin up, hero.",
];

const POKEMON_TITLES = [
  "皮卡丘電光協奏",
  "伊布月夜羈絆",
  "噴火龍烈焰守護",
  "水箭龜潮汐護陣",
  "妙蛙花森林共鳴",
  "路卡利歐波導制衡",
  "沙奈朵心靈連結",
  "烈咬陸鯊龍牙強襲",
  "甲賀忍蛙影分奇襲",
  "耿鬼暗影偷襲",
  "快龍風暴護航",
  "九尾雪域祝福",
  "暴鯉龍怒潮翻湧",
  "卡比獸厚實反擊",
  "美納斯優雅回旋",
  "雷丘超載衝擊",
  "瑪力露麗泡泡屏障",
  "風速狗赤焰奔襲",
  "幸福蛋療癒之歌",
  "巨鉗螳螂鋼翼突擊",
  "奇魯莉安夢境支援",
  "火焰雞熱浪壓制",
  "葉伊布晨露守望",
  "冰伊布霜晶凝視",
  "仙子伊布星彩祈願",
  "班基拉斯岩崩震擊",
  "烈空坐蒼穹俯衝",
  "代歐奇希斯異能脈衝",
  "夢幻彩光遊戲",
  "洛奇亞深海颶風",
];

const MELODY_TITLES = [
  "美樂蒂草莓茶會",
  "美樂蒂甜夢午安",
  "美樂蒂蝴蝶結閃耀",
  "美樂蒂雲朵散步",
  "美樂蒂粉櫻祝福",
  "美樂蒂星空小夜曲",
  "美樂蒂暖心抱抱",
  "美樂蒂蘋果派時間",
  "美樂蒂彩虹糖旋律",
  "美樂蒂蜜桃泡泡",
  "美樂蒂午後花園",
  "美樂蒂奶油微笑",
  "美樂蒂糖霜魔法",
  "美樂蒂玫瑰圓舞曲",
  "美樂蒂甜點守護",
  "美樂蒂月亮燈籠",
  "美樂蒂莓果衝刺",
  "美樂蒂兔兔能量",
  "美樂蒂繽紛派對",
  "美樂蒂薰衣草夢境",
  "美樂蒂心願信箱",
  "美樂蒂珍珠花冠",
  "美樂蒂雲朵奶昔",
  "美樂蒂草原祈禱",
  "美樂蒂小熊野餐",
  "美樂蒂閃閃樂園",
  "美樂蒂晨曦鼓舞",
  "美樂蒂緞帶守門",
  "美樂蒂粉鑽回聲",
  "美樂蒂香草驚喜",
];

function buildCards(faction: Faction, titles: string[], subtitlePrefix: string): DuelCard[] {
  return titles.map((title, index) => {
    const score = index % 3 === 0 ? -(2 + (index % 7)) : 2 + (index % 9);
    const messagePool = score >= 0 ? POSITIVE_MESSAGES : NEGATIVE_MESSAGES;
    const message = messagePool[index % messagePool.length];

    return {
      id: `${faction}-${index + 1}`,
      faction,
      title,
      subtitle: `${subtitlePrefix} CHR #${String(index + 1).padStart(2, "0")}`,
      styleLabel: "CHR Inspired",
      score,
      command: `${score >= 0 ? "+" : ""}${score} 分：${message}`,
    };
  });
}

export const pokemonCards: DuelCard[] = [
  ...buildCards("pokemon", POKEMON_TITLES, "Pokémon"),
  {
    id: "pokemon-coming-soon",
    faction: "pokemon",
    title: "限定活動卡（Coming Soon）",
    subtitle: "Pokémon Event CHR Preview",
    styleLabel: "Preview",
    score: 0,
    command: "0 分：活動卡即將解鎖，敬請期待！",
    isComingSoon: true,
  },
];

export const melodyCards: DuelCard[] = [
  ...buildCards("melody", MELODY_TITLES, "Melody"),
  {
    id: "melody-coming-soon",
    faction: "melody",
    title: "節慶限定卡（Coming Soon）",
    subtitle: "Melody Event CHR Preview",
    styleLabel: "Preview",
    score: 0,
    command: "0 分：節慶活動卡正在準備中！",
    isComingSoon: true,
  },
];

export const deckByFaction: Record<Faction, DuelCard[]> = {
  pokemon: pokemonCards,
  melody: melodyCards,
};
