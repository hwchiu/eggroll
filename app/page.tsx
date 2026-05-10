"use client";

import { useEffect, useMemo, useState } from "react";
import { deckByFaction, type DuelCard, type Faction } from "@/data/cards";
import {
  Clock3,
  Settings2,
  Swords,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

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
  arenaTheme: ArenaTheme;
  nextPlayId: number;
};

const DEFAULT_STATE: DuelState = {
  activeAttacker: "pokemon",
  pokemon: { score: 0, received: [] },
  melody: { score: 0, received: [] },
  arenaTheme: "stadium-night",
  nextPlayId: 1,
};

const ARENA_THEMES: Record<
  ArenaTheme,
  { name: string; appBg: string; topBg: string; bottomBg: string; divider: string }
> = {
  "stadium-night": {
    name: "Stadium Night",
    appBg: "linear-gradient(180deg, #0a1020 0%, #071015 100%)",
    topBg: "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.25), transparent 55%), #0f1f3a",
    bottomBg: "radial-gradient(circle at 80% 30%, rgba(244,114,182,0.22), transparent 58%), #2d1539",
    divider: "#1e3a5f",
  },
  "forest-festival": {
    name: "Forest Festival",
    appBg: "linear-gradient(180deg, #0b1a16 0%, #11221e 100%)",
    topBg: "radial-gradient(circle at 10% 10%, rgba(34,197,94,0.20), transparent 60%), #12352c",
    bottomBg: "radial-gradient(circle at 90% 20%, rgba(163,230,53,0.18), transparent 60%), #2a3a19",
    divider: "#2f4f46",
  },
  "pink-fair": {
    name: "Pink Fair",
    appBg: "linear-gradient(180deg, #180b18 0%, #220f2f 100%)",
    topBg: "radial-gradient(circle at 20% 20%, rgba(167,139,250,0.25), transparent 58%), #271944",
    bottomBg: "radial-gradient(circle at 85% 15%, rgba(244,114,182,0.24), transparent 58%), #4b1642",
    divider: "#503159",
  },
};

/* ─────────────────────── helpers ─────────────────────── */

function normalizeState(parsed: unknown): DuelState {
  if (!parsed || typeof parsed !== "object") return DEFAULT_STATE;
  const input = parsed as Partial<DuelState> & {
    pokemon?: Partial<SideState>;
    melody?: Partial<SideState>;
  };
  const activeAttacker =
    input.activeAttacker === "pokemon" || input.activeAttacker === "melody"
      ? input.activeAttacker
      : DEFAULT_STATE.activeAttacker;
  const arenaTheme =
    input.arenaTheme && input.arenaTheme in ARENA_THEMES
      ? input.arenaTheme
      : DEFAULT_STATE.arenaTheme;
  const pokemonReceived = Array.isArray(input.pokemon?.received) ? input.pokemon!.received : [];
  const melodyReceived = Array.isArray(input.melody?.received) ? input.melody!.received : [];
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
    nextPlayId:
      typeof input.nextPlayId === "number" && input.nextPlayId > 0
        ? input.nextPlayId
        : maxPersistedId + 1,
    pokemon: {
      score: typeof input.pokemon?.score === "number" ? input.pokemon.score : 0,
      received: pokemonReceived,
    },
    melody: {
      score: typeof input.melody?.score === "number" ? input.melody.score : 0,
      received: melodyReceived,
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

/** Recover the original DuelCard from a played-card record. */
function lookupCard(played: PlayedCard): DuelCard | undefined {
  const cardId = played.instanceId.replace(/-\d+$/, "");
  return deckByFaction[played.from]?.find((c) => c.id === cardId);
}

/* ─────────────────────── CardTile ─────────────────────── */

type CardSize = "small" | "medium" | "large";

const CARD_DIMS: Record<
  CardSize,
  { w: number; h: number; imgH: number; titleSize: number; textSize: number }
> = {
  small:  { w: 80,  h: 112, imgH: 50,  titleSize: 6,  textSize: 5 },
  medium: { w: 110, h: 154, imgH: 72,  titleSize: 8,  textSize: 6 },
  large:  { w: 230, h: 322, imgH: 160, titleSize: 13, textSize: 10 },
};

function CardTile({
  card,
  size = "medium",
  onClick,
  isSelected,
  style,
}: {
  card: DuelCard;
  size?: CardSize;
  onClick?: () => void;
  isSelected?: boolean;
  style?: React.CSSProperties;
}) {
  const [imgError, setImgError] = useState(false);
  const isPokemon = card.faction === "pokemon";
  const isPositive = card.score >= 0;
  const d = CARD_DIMS[size];

  const headerGradient = isPokemon
    ? "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)"
    : "linear-gradient(135deg, #831843 0%, #ec4899 100%)";

  const imgBg = isPokemon
    ? "linear-gradient(180deg, #dbeafe 0%, #bfdbfe 60%, #93c5fd 100%)"
    : "linear-gradient(180deg, #fce7f3 0%, #fbcfe8 60%, #f9a8d4 100%)";

  const borderColor = isPokemon ? "#fbbf24" : "#f472b6";

  return (
    <div
      onClick={onClick}
      className={`card-tile${isSelected ? " card-selected" : ""}${onClick ? " card-clickable" : ""}`}
      style={{
        width: d.w,
        height: d.h,
        flexShrink: 0,
        borderRadius: 10,
        overflow: "hidden",
        border: `2px solid ${borderColor}`,
        boxShadow: isSelected
          ? `0 0 0 3px #fbbf24, 0 8px 24px rgba(0,0,0,0.5)`
          : `0 4px 16px rgba(0,0,0,0.4)`,
        display: "flex",
        flexDirection: "column",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: headerGradient,
          padding: `${d.titleSize * 0.4}px ${d.titleSize * 0.6}px`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: d.titleSize,
            color: "white",
            fontWeight: 800,
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {card.title}
        </div>
        <div
          style={{ fontSize: d.textSize - 1, color: "rgba(255,255,255,0.65)", lineHeight: 1 }}
        >
          {card.subtitle}
        </div>
      </div>

      {/* Image area */}
      <div
        style={{
          height: d.imgH,
          background: imgBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {card.image && !imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={card.image}
            alt={card.title}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : card.emoji ? (
          <span style={{ fontSize: d.imgH * 0.45, lineHeight: 1 }}>{card.emoji}</span>
        ) : (
          <span style={{ fontSize: d.imgH * 0.3, opacity: 0.4 }}>🃏</span>
        )}

        {/* Score badge */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            background: isPositive ? "rgba(16,185,129,0.92)" : "rgba(239,68,68,0.92)",
            color: "white",
            fontWeight: 900,
            fontSize: d.titleSize + 1,
            padding: `1px ${d.titleSize * 0.5}px`,
            borderRadius: 4,
            fontFamily: "monospace",
            lineHeight: 1.5,
          }}
        >
          {isPositive ? "+" : ""}
          {card.score}
        </div>

        {/* Coming Soon overlay */}
        {card.isComingSoon && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: d.textSize + 1, color: "#fbbf24", fontWeight: 700 }}>
              Coming Soon
            </span>
          </div>
        )}
      </div>

      {/* Footer effect text */}
      <div
        style={{
          background: "rgba(0,0,0,0.75)",
          flex: 1,
          padding: `${d.textSize * 0.4}px ${d.textSize * 0.6}px`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: d.textSize,
            color: "#d1d5db",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: size === "large" ? 4 : 2,
            overflow: "hidden",
          }}
        >
          {card.command}
        </div>
      </div>

      {/* Holographic shimmer */}
      <div className="card-shine-layer" />
    </div>
  );
}

/* ─────────────────────── FanHand ─────────────────────── */

function FanHand({
  cards,
  onPlayRequest,
}: {
  cards: DuelCard[];
  onPlayRequest: () => void;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const handCards = cards.slice(0, 7);
  const total = handCards.length;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "200px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
      }}
    >
      {handCards.map((card, i) => {
        const center = (total - 1) / 2;
        const offset = i - center;
        const rotation = offset * 9;
        const baseY = Math.abs(offset) * 8;
        const translateX = offset * 38;
        const isHovered = hoveredIdx === i;

        return (
          <div
            key={card.id}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={onPlayRequest}
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: `translateX(calc(-50% + ${translateX}px)) translateY(${
                isHovered ? -32 : baseY
              }px) rotate(${isHovered ? 0 : rotation}deg)`,
              transformOrigin: "bottom center",
              zIndex: isHovered ? 50 : total - Math.abs(Math.round(offset)),
              transition: "transform 0.18s ease",
              cursor: "pointer",
            }}
          >
            <CardTile card={card} size="medium" />
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────── CardCarousel ─────────────────────── */

function CardCarousel({
  deck,
  onPlay,
  onClose,
}: {
  deck: DuelCard[];
  onPlay: (card: DuelCard) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);

  const total = deck.length;
  const cur = deck[index];
  const prevIdx = (index - 1 + total) % total;
  const nextIdx = (index + 1) % total;

  const prev = () => setIndex(prevIdx);
  const next = () => setIndex(nextIdx);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>選擇出牌</div>
          <div style={{ color: "#9ca3af", fontSize: 12 }}>
            {index + 1} / {total} · 使用方向鍵或點擊切換
          </div>
        </div>

        {/* Three-card stack */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <div
            onClick={prev}
            style={{
              transform: "scale(0.72) translateX(40px)",
              opacity: 0.45,
              cursor: "pointer",
              transition: "all 0.2s ease",
              zIndex: 1,
            }}
          >
            <CardTile card={deck[prevIdx]} size="large" />
          </div>

          <div style={{ zIndex: 2, transform: "scale(1)", transition: "all 0.25s ease" }}>
            <CardTile card={cur} size="large" isSelected />
          </div>

          <div
            onClick={next}
            style={{
              transform: "scale(0.72) translateX(-40px)",
              opacity: 0.45,
              cursor: "pointer",
              transition: "all 0.2s ease",
              zIndex: 1,
            }}
          >
            <CardTile card={deck[nextIdx]} size="large" />
          </div>
        </div>

        {/* Navigation row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={prev}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              borderRadius: 8,
              padding: "8px 12px",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => onPlay(cur)}
            disabled={cur.isComingSoon}
            style={{
              background: cur.isComingSoon ? "rgba(255,255,255,0.1)" : "#10b981",
              border: "none",
              borderRadius: 12,
              padding: "10px 28px",
              color: cur.isComingSoon ? "#6b7280" : "#022c22",
              fontWeight: 800,
              fontSize: 14,
              cursor: cur.isComingSoon ? "not-allowed" : "pointer",
            }}
          >
            {cur.isComingSoon ? "Coming Soon" : "⚡ 出此牌"}
          </button>

          <button
            onClick={next}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              borderRadius: 8,
              padding: "8px 12px",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            padding: "4px 14px",
            color: "#9ca3af",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          取消
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── ZoneHeader ─────────────────────── */

function ZoneHeader({
  faction,
  label,
  isAttacker,
  score,
  factionName,
}: {
  faction: Faction;
  label: string;
  isAttacker: boolean;
  score: number;
  factionName: Record<Faction, string>;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
          {factionName[faction]} CHR 陣營
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 12,
            background: isAttacker ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.2)",
            color: isAttacker ? "#6ee7b7" : "#a5b4fc",
          }}
        >
          {isAttacker ? "出牌方 ⚔️" : "接收方 🛡"}
        </span>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 20,
            fontWeight: 900,
            color: score >= 0 ? "#6ee7b7" : "#fca5a5",
          }}
        >
          {score >= 0 ? "+" : ""}
          {score}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── ReceivedRow ─────────────────────── */

function ReceivedRow({ received }: { received: PlayedCard[] }) {
  if (received.length === 0) {
    return (
      <div style={{ color: "#6b7280", fontSize: 12, padding: "8px 16px" }}>
        尚未接收任何卡牌...
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        overflowX: "auto",
        padding: "8px 16px 12px",
        scrollbarWidth: "thin",
      }}
    >
      {received.slice(0, 12).map((played) => {
        const cardDef = lookupCard(played);
        if (cardDef) {
          return <CardTile key={played.instanceId} card={cardDef} size="small" />;
        }
        return (
          <div
            key={played.instanceId}
            style={{
              width: 80,
              height: 112,
              flexShrink: 0,
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "6px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 7, color: "white", fontWeight: 700 }}>{played.title}</div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                fontWeight: 900,
                color: played.score >= 0 ? "#6ee7b7" : "#fca5a5",
              }}
            >
              {played.score >= 0 ? "+" : ""}
              {played.score}
            </div>
          </div>
        );
      })}
      {received.length > 12 && (
        <div style={{ color: "#9ca3af", fontSize: 11, flexShrink: 0 }}>
          +{received.length - 12} 張
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── ActionLog ─────────────────────── */

function ActionLog({
  attacker,
  receiverReceived,
}: {
  attacker: Faction;
  receiverReceived: PlayedCard[];
}) {
  const myPlays = receiverReceived.filter((p) => p.from === attacker).slice(0, 6);
  return (
    <div
      style={{
        width: 160,
        flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.08)",
        overflowY: "auto",
        padding: "8px",
        scrollbarWidth: "thin",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        最近行動
      </div>
      {myPlays.length === 0 ? (
        <div style={{ fontSize: 11, color: "#4b5563" }}>尚無出牌</div>
      ) : (
        myPlays.map((p) => (
          <div
            key={p.instanceId}
            style={{
              marginBottom: 6,
              padding: "5px 6px",
              borderRadius: 6,
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "white",
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {p.title}
            </div>
            <div
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                color: p.score >= 0 ? "#6ee7b7" : "#fca5a5",
              }}
            >
              {p.score >= 0 ? "+" : ""}
              {p.score} · {formatDate(p.playedAt).slice(5)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ─────────────────────── SidebarContent ─────────────────────── */

function SidebarContent({
  elapsed,
  battleStats,
  duel,
  attacker,
  factionName,
  onPlay,
  onSwap,
  onSettings,
}: {
  elapsed: number;
  battleStats: { totalPlays: number; pokemonSent: number; melodySent: number };
  duel: DuelState;
  attacker: Faction;
  factionName: Record<Faction, string>;
  onPlay: () => void;
  onSwap: () => void;
  onSettings: () => void;
}) {
  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h1 style={{ fontSize: 13, fontWeight: 900, color: "white", margin: 0, lineHeight: 1.3 }}>
        雙人 CHR
        <br />
        卡牌對戰場
      </h1>

      {/* Timer */}
      <div
        style={{
          borderRadius: 10,
          border: "1px solid rgba(251,191,36,0.3)",
          background: "rgba(245,158,11,0.1)",
          padding: "8px 10px",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "#fde68a",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Clock3 size={10} /> 時間計算器
        </div>
        <div
          style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#fef3c7" }}
        >
          {timerText(elapsed)}
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.25)",
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>對戰統計</div>
        {(
          [
            ["總出牌", battleStats.totalPlays, "#67e8f9"],
            ["寶可夢", battleStats.pokemonSent, "#93c5fd"],
            ["美樂蒂", battleStats.melodySent, "#f9a8d4"],
          ] as const
        ).map(([label, val, color]) => (
          <div
            key={label}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <span style={{ fontSize: 11, color: "#d1d5db" }}>{label}</span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 14,
                fontWeight: 700,
                color,
              }}
            >
              {val}
            </span>
          </div>
        ))}
      </div>

      {/* Scores */}
      <div
        style={{
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.25)",
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>對戰分數</div>
        {(["pokemon", "melody"] as Faction[]).map((f) => (
          <div
            key={f}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <span style={{ fontSize: 11, color: "#d1d5db" }}>{factionName[f]}</span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 16,
                fontWeight: 900,
                color: duel[f].score >= 0 ? "#6ee7b7" : "#fca5a5",
              }}
            >
              {duel[f].score >= 0 ? "+" : ""}
              {duel[f].score}
            </span>
          </div>
        ))}
      </div>

      {/* Current attacker */}
      <div
        style={{
          borderRadius: 10,
          background: "rgba(16,185,129,0.12)",
          border: "1px solid rgba(16,185,129,0.3)",
          padding: "6px 10px",
          fontSize: 11,
          color: "#6ee7b7",
        }}
      >
        ⚔️ 目前出牌方：{factionName[attacker]}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onClick={onPlay}
          style={{
            background: "#10b981",
            border: "none",
            borderRadius: 10,
            padding: "9px 0",
            color: "#022c22",
            fontWeight: 800,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Swords size={14} /> 出牌
        </button>

        <button
          onClick={onSwap}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            padding: "8px 0",
            color: "white",
            fontWeight: 600,
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <RefreshCw size={12} /> 換手
        </button>

        <button
          onClick={onSettings}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "8px 0",
            color: "#d1d5db",
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Settings2 size={12} /> 設定
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── Main component ─────────────────────── */

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
  const [showSidebar, setShowSidebar] = useState(false);
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
      totalPlays: duel.pokemon.received.length + duel.melody.received.length,
      pokemonSent: duel.melody.received.length,
      melodySent: duel.pokemon.received.length,
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

  const resetDuel = () => {
    setDuel(DEFAULT_STATE);
    setShowSettings(false);
    setShowCardPicker(false);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: activeTheme.appBg,
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: showSidebar ? 220 : 44,
          flexShrink: 0,
          transition: "width 0.28s ease",
          overflow: "hidden",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          onClick={() => setShowSidebar((s) => !s)}
          title={showSidebar ? "收合側欄" : "展開側欄"}
          style={{
            flexShrink: 0,
            height: 44,
            width: "100%",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: showSidebar ? "flex-end" : "center",
            padding: showSidebar ? "0 12px" : "0",
            gap: 6,
          }}
        >
          {showSidebar ? (
            <>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>收合</span>
              <PanelLeftClose size={16} />
            </>
          ) : (
            <PanelLeftOpen size={16} />
          )}
        </button>

        <div
          style={{
            flex: 1,
            overflow: "hidden",
            opacity: showSidebar ? 1 : 0,
            transition: "opacity 0.15s ease",
            pointerEvents: showSidebar ? "auto" : "none",
          }}
        >
          <SidebarContent
            elapsed={elapsed}
            battleStats={battleStats}
            duel={duel}
            attacker={attacker}
            factionName={factionName}
            onPlay={() => setShowCardPicker(true)}
            onSwap={swapTurn}
            onSettings={() => setShowSettings(true)}
          />
        </div>
      </aside>

      {/* ── Main battle area ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Opponent zone (top) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: activeTheme.topBg,
            minHeight: 0,
          }}
        >
          <ZoneHeader
            faction={receiver}
            label="上方玩家 · 對手接收區"
            isAttacker={false}
            score={duel[receiver].score}
            factionName={factionName}
          />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <ReceivedRow received={duel[receiver].received} />
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 2,
            flexShrink: 0,
            background: `linear-gradient(90deg, transparent, ${activeTheme.divider}, transparent)`,
          }}
        />

        {/* Player zone (bottom) */}
        <div
          style={{
            flex: 1.4,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: activeTheme.bottomBg,
            minHeight: 0,
          }}
        >
          <ZoneHeader
            faction={attacker}
            label="下方玩家 · 我的出牌區"
            isAttacker={true}
            score={duel[attacker].score}
            factionName={factionName}
          />

          <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
            <ActionLog
              attacker={attacker}
              receiverReceived={duel[receiver].received}
            />

            {/* Fan hand area */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: "8px 8px 12px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, textAlign: "center" }}>
                手牌預覽 · 點擊任意牌或下方按鈕出牌
              </div>
              <FanHand
                cards={attackerDeck.filter((c) => !c.isComingSoon)}
                onPlayRequest={() => setShowCardPicker(true)}
              />
              <button
                onClick={() => setShowCardPicker(true)}
                style={{
                  marginTop: 10,
                  background: "#10b981",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 24px",
                  color: "#022c22",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Swords size={14} /> 出牌（{factionName[attacker]}）
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Card carousel overlay */}
      {showCardPicker && (
        <CardCarousel
          deck={attackerDeck}
          onPlay={playCard}
          onClose={() => setShowCardPicker(false)}
        />
      )}

      {/* Settings modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowSettings(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: 20,
              width: 320,
              maxWidth: "90vw",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <h3
                style={{ color: "white", fontSize: 14, fontWeight: 700, margin: 0 }}
              >
                對戰場景設定
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 12 }}>
              切換底部場景配色，兩方共用。
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(Object.keys(ARENA_THEMES) as ArenaTheme[]).map((themeKey) => (
                <button
                  key={themeKey}
                  onClick={() => setDuel((prev) => ({ ...prev, arenaTheme: themeKey }))}
                  style={{
                    background:
                      duel.arenaTheme === themeKey
                        ? "rgba(6,182,212,0.12)"
                        : "rgba(255,255,255,0.04)",
                    border: `1px solid ${
                      duel.arenaTheme === themeKey
                        ? "rgba(6,182,212,0.5)"
                        : "rgba(255,255,255,0.08)"
                    }`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: duel.arenaTheme === themeKey ? "#67e8f9" : "#d1d5db",
                    fontSize: 13,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {ARENA_THEMES[themeKey].name}
                </button>
              ))}
            </div>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}
            >
              <button
                onClick={resetDuel}
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 8,
                  padding: "6px 14px",
                  color: "#fca5a5",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                重置對戰
              </button>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  padding: "6px 14px",
                  color: "#e5e7eb",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
