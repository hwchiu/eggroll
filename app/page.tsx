"use client";

import { useEffect, useMemo, useState } from "react";
import { deckByFaction, type DuelCard, type Faction } from "@/data/cards";
import { Clock3, Settings2, Swords, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

const START_DATE = new Date("2026-04-01T03:00:00");
const STORAGE_KEY = "eggroll-duel-arena-v1";

type SideState = {
  score: number;
  received: PlayedCard[];
};

type PlayedCard = {
  instanceId: string;
  from: Faction;
  to: Faction;
  title: string;
  subtitle: string;
  score: number;
  command: string;
  playedAt: string;
};

type ArenaTheme = "stadium-night" | "forest-festival" | "pink-fair";

type DuelState = {
  activeAttacker: Faction;
  pokemon: SideState;
  melody: SideState;
  expandedReceived: Record<Faction, boolean>;
  arenaTheme: ArenaTheme;
  nextPlayId: number;
};

const DEFAULT_STATE: DuelState = {
  activeAttacker: "pokemon",
  pokemon: { score: 0, received: [] },
  melody: { score: 0, received: [] },
  expandedReceived: { pokemon: false, melody: false },
  arenaTheme: "stadium-night",
  nextPlayId: 1,
};

const ARENA_THEMES: Record<ArenaTheme, { name: string; appBg: string; topBg: string; bottomBg: string; cardBorder: string }> = {
  "stadium-night": {
    name: "Stadium Night",
    appBg: "linear-gradient(180deg, #0a1020 0%, #071015 100%)",
    topBg: "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.25), transparent 55%), #0f1f3a",
    bottomBg: "radial-gradient(circle at 80% 30%, rgba(244,114,182,0.22), transparent 58%), #2d1539",
    cardBorder: "#1f2937",
  },
  "forest-festival": {
    name: "Forest Festival",
    appBg: "linear-gradient(180deg, #0b1a16 0%, #11221e 100%)",
    topBg: "radial-gradient(circle at 10% 10%, rgba(34,197,94,0.20), transparent 60%), #12352c",
    bottomBg: "radial-gradient(circle at 90% 20%, rgba(163,230,53,0.18), transparent 60%), #2a3a19",
    cardBorder: "#2f4f46",
  },
  "pink-fair": {
    name: "Pink Fair",
    appBg: "linear-gradient(180deg, #180b18 0%, #220f2f 100%)",
    topBg: "radial-gradient(circle at 20% 20%, rgba(167,139,250,0.25), transparent 58%), #271944",
    bottomBg: "radial-gradient(circle at 85% 15%, rgba(244,114,182,0.24), transparent 58%), #4b1642",
    cardBorder: "#503159",
  },
};

function normalizeState(parsed: unknown): DuelState {
  if (!parsed || typeof parsed !== "object") return DEFAULT_STATE;
  const input = parsed as Partial<DuelState> & { pokemon?: Partial<SideState>; melody?: Partial<SideState> };
  const activeAttacker = input.activeAttacker === "pokemon" || input.activeAttacker === "melody" ? input.activeAttacker : DEFAULT_STATE.activeAttacker;
  const arenaTheme = input.arenaTheme && input.arenaTheme in ARENA_THEMES ? input.arenaTheme : DEFAULT_STATE.arenaTheme;
  const pokemonReceived = Array.isArray(input.pokemon?.received) ? input.pokemon.received : [];
  const melodyReceived = Array.isArray(input.melody?.received) ? input.melody.received : [];
  const maxPersistedId = [...pokemonReceived, ...melodyReceived].reduce((max, card) => {
    if (!card || typeof card !== "object" || !("instanceId" in card)) return max;
    const raw = String(card.instanceId);
    const match = raw.match(/-(\d+)$/);
    const parsedNum = match ? Number(match[1]) : NaN;
    return Number.isFinite(parsedNum) ? Math.max(max, parsedNum) : max;
  }, 0);

  return {
    activeAttacker,
    arenaTheme,
    nextPlayId: typeof input.nextPlayId === "number" && input.nextPlayId > 0 ? input.nextPlayId : maxPersistedId + 1,
    pokemon: {
      score: typeof input.pokemon?.score === "number" ? input.pokemon.score : 0,
      received: pokemonReceived,
    },
    melody: {
      score: typeof input.melody?.score === "number" ? input.melody.score : 0,
      received: melodyReceived,
    },
    expandedReceived: {
      pokemon: Boolean(input.expandedReceived?.pokemon),
      melody: Boolean(input.expandedReceived?.melody),
    },
  };
}

function getReceiver(attacker: Faction): Faction {
  return attacker === "pokemon" ? "melody" : "pokemon";
}

function timerText(elapsed: number): string {
  const d = Math.floor(elapsed / 86400);
  const h = Math.floor((elapsed % 86400) / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = Math.floor(elapsed % 60);
  return `${String(d).padStart(2, "0")}:${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("zh-TW", { hour12: false });
}

export default function Home() {
  const [duel, setDuel] = useState<DuelState>(() => {
    if (typeof window === "undefined") return DEFAULT_STATE;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    try {
      return normalizeState(JSON.parse(raw));
    } catch {
      return DEFAULT_STATE;
    }
  });
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const updateElapsed = () => {
      const sec = Math.max(0, Math.floor((Date.now() - START_DATE.getTime()) / 1000));
      setElapsed(sec);
    };

    updateElapsed();
    const id = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(duel));
  }, [duel]);

  const factionName: Record<Faction, string> = { pokemon: "寶可夢", melody: "美樂蒂" };
  const attacker = duel.activeAttacker;
  const receiver = getReceiver(attacker);
  const attackerDeck = deckByFaction[attacker];
  const activeTheme = ARENA_THEMES[duel.arenaTheme];

  const battleStats = useMemo(
    () => ({
      pokemonSent: duel.melody.received.length,
      melodySent: duel.pokemon.received.length,
      totalPlays: duel.pokemon.received.length + duel.melody.received.length,
    }),
    [duel]
  );

  const playCard = (card: DuelCard) => {
    if (card.isComingSoon) return;
    setDuel((prev) => {
      const from = prev.activeAttacker;
      const to = getReceiver(from);
      const played: PlayedCard = {
        instanceId: `${card.id}-${prev.nextPlayId}`,
        from,
        to,
        title: card.title,
        subtitle: card.subtitle,
        score: card.score,
        command: card.command,
        playedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        nextPlayId: prev.nextPlayId + 1,
        [to]: {
          ...prev[to],
          score: prev[to].score + card.score,
          received: [played, ...prev[to].received],
        },
      };
    });

    setShowCardPicker(false);
  };

  const swapTurn = () => {
    setDuel((prev) => ({ ...prev, activeAttacker: getReceiver(prev.activeAttacker) }));
  };

  const toggleExpand = (faction: Faction) => {
    setDuel((prev) => ({
      ...prev,
      expandedReceived: {
        ...prev.expandedReceived,
        [faction]: !prev.expandedReceived[faction],
      },
    }));
  };

  const resetDuel = () => {
    setDuel(DEFAULT_STATE);
    setShowSettings(false);
    setShowCardPicker(false);
  };

  const sidePanel = (faction: Faction, title: string) => {
    const side = duel[faction];
    const isAttacker = duel.activeAttacker === faction;
    const isExpanded = duel.expandedReceived[faction];
    const cards = isExpanded ? side.received : side.received.slice(0, 4);
    const sideBg = faction === "pokemon" ? activeTheme.topBg : activeTheme.bottomBg;

    return (
      <section
        className="rounded-2xl border p-4 md:p-5"
        style={{
          background: sideBg,
          borderColor: activeTheme.cardBorder,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-gray-400">{title}</div>
            <h2 className="text-lg font-bold text-white mt-1">{factionName[faction]} CHR 陣營</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isAttacker ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-600/30 text-slate-300"}`}>
              {isAttacker ? "當前出牌方" : "當前接收方"}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-200">
              牌組 {deckByFaction[faction].length} 張
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border p-3 bg-black/20 border-white/10">
            <div className="text-xs text-gray-400">對戰分數</div>
            <div className={`mt-1 font-mono text-3xl font-black ${side.score >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {side.score >= 0 ? "+" : ""}
              {side.score}
            </div>
          </div>
          <div className="rounded-xl border p-3 bg-black/20 border-white/10">
            <div className="text-xs text-gray-400">已接收牌數</div>
            <div className="mt-1 font-mono text-2xl font-bold text-cyan-200">{side.received.length}</div>
          </div>
          <div className="rounded-xl border p-3 bg-black/20 border-white/10">
            <div className="text-xs text-gray-400">最新指令效果</div>
            <div className="mt-1 text-xs text-white line-clamp-2">{side.received[0]?.command ?? "尚未接收卡牌"}</div>
          </div>
          <div className="rounded-xl border p-3 bg-black/20 border-white/10">
            <div className="text-xs text-gray-400">最後更新</div>
            <div className="mt-1 text-xs text-gray-200">{side.received[0] ? formatDate(side.received[0].playedAt) : "-"}</div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">接收檯面</div>
            {side.received.length > 4 && (
              <button
                onClick={() => toggleExpand(faction)}
                className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200"
              >
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {isExpanded ? "縮合" : "展開"}
              </button>
            )}
          </div>
          {side.received.length === 0 ? (
            <p className="mt-3 text-xs text-gray-400">目前無卡牌。</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-auto pr-1">
              {cards.map((played) => (
                <article key={played.instanceId} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-gray-400">{played.subtitle}</div>
                      <div className="text-sm font-semibold text-white truncate">{played.title}</div>
                    </div>
                    <div className={`font-mono text-sm font-bold ${played.score >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                      {played.score >= 0 ? "+" : ""}
                      {played.score}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-300">{played.command}</div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen" style={{ background: activeTheme.appBg }}>
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6">
        <header className="rounded-2xl border border-white/10 bg-black/25 backdrop-blur-sm p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">雙人 CHR 卡牌對戰場</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-300">上下分區攻防、分數即時累積、操作可續玩、支援行動裝置。</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-xl border border-orange-400/30 bg-orange-500/10 px-3 py-2 text-right">
                <div className="flex items-center justify-end gap-1 text-[11px] text-orange-200"><Clock3 size={12} /> 時間計算器</div>
                <div className="font-mono text-sm sm:text-base font-bold text-orange-100">{timerText(elapsed)}</div>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
              >
                <Settings2 size={14} /> Settings
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-[11px] text-gray-400">總出牌次數</div>
              <div className="font-mono text-lg font-bold text-cyan-200">{battleStats.totalPlays}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-[11px] text-gray-400">寶可夢出牌</div>
              <div className="font-mono text-lg font-bold text-blue-200">{battleStats.pokemonSent}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-[11px] text-gray-400">美樂蒂出牌</div>
              <div className="font-mono text-lg font-bold text-pink-200">{battleStats.melodySent}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCardPicker(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-emerald-950 hover:bg-emerald-400"
            >
              <Swords size={15} /> 出牌 Action（{factionName[attacker]}）
            </button>
            <button
              onClick={swapTurn}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              <RefreshCw size={14} /> 上下方轉至
            </button>
            <span className="text-xs text-gray-300">目前由「{factionName[attacker]}」對「{factionName[receiver]}」出牌</span>
          </div>
        </header>

        <div className="mt-4 space-y-4">
          {sidePanel("pokemon", "上方玩家")}
          {sidePanel("melody", "下方玩家")}
        </div>

        <footer className="mt-5 text-center text-xs text-gray-400">對戰風格參考卡牌對戰介面｜含 CHR 風格牌組、分數計算、持久化存檔</footer>
      </div>

      {showCardPicker && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-3 sm:p-6" role="dialog" aria-modal="true">
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/15 bg-slate-950 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">選擇要出給對手的卡牌</div>
                <div className="text-xs text-gray-400">目前可選 {attackerDeck.length - 1} 張主卡 + Coming Soon 預告卡</div>
              </div>
              <button onClick={() => setShowCardPicker(false)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-gray-200 hover:bg-white/10">關閉</button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[70vh] overflow-auto pr-1">
              {attackerDeck.map((card) => (
                <article
                  key={card.id}
                  className={`rounded-xl border p-3 ${card.isComingSoon ? "border-amber-400/30 bg-amber-500/10" : "border-white/10 bg-white/5"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] text-gray-400">{card.subtitle}</div>
                      <h3 className="text-sm font-bold text-white mt-0.5">{card.title}</h3>
                      <div className="mt-1 text-[11px] text-cyan-200">{card.styleLabel}</div>
                    </div>
                    <div className={`font-mono text-sm font-black ${card.score >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                      {card.score >= 0 ? "+" : ""}{card.score}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-300 min-h-10">{card.command}</p>
                  <button
                    onClick={() => playCard(card)}
                    disabled={card.isComingSoon}
                    className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold ${card.isComingSoon ? "cursor-not-allowed bg-white/10 text-gray-400" : "bg-cyan-500 text-cyan-950 hover:bg-cyan-400"}`}
                  >
                    {card.isComingSoon ? "Coming Soon" : "選擇此卡出牌"}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-3 sm:p-6" role="dialog" aria-modal="true">
          <div className="mx-auto max-w-lg rounded-2xl border border-white/15 bg-slate-950 p-4">
            <h3 className="text-sm font-bold text-white">對戰場景設定</h3>
            <p className="mt-1 text-xs text-gray-400">可切換底部場景與配色，兩方共用。</p>
            <div className="mt-4 space-y-2">
              {(Object.keys(ARENA_THEMES) as ArenaTheme[]).map((themeKey) => (
                <button
                  key={themeKey}
                  onClick={() => setDuel((prev) => ({ ...prev, arenaTheme: themeKey }))}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${duel.arenaTheme === themeKey ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-200" : "border-white/10 bg-white/5 text-gray-200"}`}
                >
                  {ARENA_THEMES[themeKey].name}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button onClick={resetDuel} className="rounded-lg border border-rose-400/40 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-500/10">重置對戰紀錄</button>
              <button onClick={() => setShowSettings(false)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-gray-100 hover:bg-white/10">完成</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
