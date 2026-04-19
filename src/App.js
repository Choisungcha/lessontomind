import { useState, useRef, useEffect } from "react";

// ── Fonts ─────────────────────────────────────────────────────────────────────
const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href =
  "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600;700&family=Noto+Sans+KR:wght@300;400;500;600&display=swap";
document.head.appendChild(_fl);

const _gs = document.createElement("style");
_gs.innerHTML = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#F5F0E8; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes inkIn  { from{opacity:0;transform:scale(.94) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes pulse  { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.2);opacity:1} }
  @keyframes pop    { 0%{transform:scale(0)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }
  .fu{animation:fadeUp .55s ease both} .fi{animation:fadeIn .4s ease both} .ii{animation:inkIn .4s cubic-bezier(.22,.68,0,1.2) both}
  .d1{animation-delay:.07s} .d2{animation-delay:.15s} .d3{animation-delay:.23s}
  .d4{animation-delay:.31s} .d5{animation-delay:.39s} .d6{animation-delay:.47s}
  textarea:focus,input:focus,select:focus{outline:none}
  button{cursor:pointer}
  .moodbtn:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.12)!important}
  .modebtn:hover{opacity:.85}
  .cardhover:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.10)!important}
  .ctahover:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(196,168,130,.4)!important}
  .ghosthover:hover{background:#EDE8DE!important}
  .ta{caret-color:#8B6F47;line-height:2.1;letter-spacing:.02em}
  .ta::placeholder{color:#C4B49A}
  .finput:focus{border-color:#8B6F47!important}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#D4C4A8;border-radius:2px}
`;
document.head.appendChild(_gs);

// ── Constants ─────────────────────────────────────────────────────────────────
const SERIF = "'Noto Serif KR', Georgia, serif";
const SANS = "'Noto Sans KR', sans-serif";
const CREAM = "#F5F0E8";
const INK = "#2A2018";
const BROWN = "#8B6F47";

const MOODS = [
  {
    id: "grateful",
    emoji: "☀️",
    label: "감사함",
    color: "#C4873A",
    bg: "#FBF3E8",
    pos: true,
  },
  {
    id: "joyful",
    emoji: "🌸",
    label: "행복함",
    color: "#C4607A",
    bg: "#FAEEF2",
    pos: true,
  },
  {
    id: "proud",
    emoji: "✨",
    label: "뿌듯함",
    color: "#7A9B4A",
    bg: "#EEF5E8",
    pos: true,
  },
  {
    id: "excited",
    emoji: "🎉",
    label: "신남",
    color: "#C49A3A",
    bg: "#FBF6E8",
    pos: true,
  },
  {
    id: "calm",
    emoji: "🕊",
    label: "평온함",
    color: "#7A8EB8",
    bg: "#EEF0F8",
    pos: true,
  },
  {
    id: "hopeful",
    emoji: "🌱",
    label: "설렘",
    color: "#4A8A5A",
    bg: "#EAF3EC",
    pos: true,
  },
  {
    id: "lonely",
    emoji: "🌧",
    label: "쓸쓸함",
    color: "#6A7AA8",
    bg: "#ECEEF7",
    pos: false,
  },
  {
    id: "anxious",
    emoji: "🌀",
    label: "불안함",
    color: "#9B7FA3",
    bg: "#F4EEF8",
    pos: false,
  },
  {
    id: "nostalgic",
    emoji: "🍂",
    label: "그리움",
    color: "#A0785A",
    bg: "#F5EDE6",
    pos: false,
  },
  {
    id: "tired",
    emoji: "🌙",
    label: "지침",
    color: "#5A7A6A",
    bg: "#EBF2EE",
    pos: false,
  },
  {
    id: "numb",
    emoji: "😶",
    label: "무감각함",
    color: "#8A8A8A",
    bg: "#F0F0F0",
    pos: false,
  },
  {
    id: "confused",
    emoji: "💭",
    label: "혼란스러움",
    color: "#9A7A5A",
    bg: "#F5F0E8",
    pos: false,
  },
];
const getMood = (id) => MOODS.find((m) => m.id === id);

// ── Prompts ───────────────────────────────────────────────────────────────────
const SYS_ESSAY = (label, isPos) =>
  `당신은 '작가수업' 글쓰기 코치입니다. 사용자의 "${label}" 감정을 치유형 에세이로 써낼 수 있도록 돕습니다.
${
  isPos
    ? "긍정 감정이므로 밝고 따뜻한 톤으로 질문하세요."
    : "부정 감정이므로 부드럽고 공감적인 톤으로 질문하세요."
}
규칙: 질문 하나만, 2~3문장 이내, 감각적 질문("어떤 냄새","그 표정","몇 시쯤"), 문학적 언어.`;

const SYS_COUNSEL = (label, isPos) =>
  `당신은 '작가수업' 심리상담사 '마음이'입니다. 사용자가 "${label}" 감정으로 상담을 시작했습니다.
${
  isPos
    ? "긍정 감정도 더 깊이 탐구하고 음미하도록 이끄세요."
    : "판단 없이 감정을 수용하고 공감하며 천천히 풀어내도록 도우세요."
}
규칙: 공감 먼저 → 질문 하나, 3~4문장 이내, 진단·처방 금지, 따뜻하고 문학적인 언어.
위기 상황(자해·자살) 시 반드시 전문 기관(정신건강 위기상담 전화 1577-0199) 안내.`;

const SYS_ESSAY_GEN = `다음 대화를 바탕으로 아름다운 한국어 에세이를 완성하세요.
조건: 600~900자, 1인칭, 구체적 감각 묘사, 문학적 문체, 자연스러운 기승전결, 여운 있는 마지막 문장.
에세이 본문만 출력, 제목 없음.`;

const SYS_COUNSEL_ESSAY = `다음 심리상담 대화를 바탕으로 치유형 에세이를 써주세요.
조건: 400~600자, 1인칭, 감정 여정 담기, 희망적 여운으로 마무리.
에세이 본문만 출력, 제목 없음.`;

const SYS_TITLE = `다음 에세이에 어울리는 짧고 시적인 한국어 제목을 한 줄로만 답하세요. 따옴표·설명 없이.`;

const SYS_SUMMARY = `다음 상담 대화를 바탕으로 내담자의 감정 상태를 2~3문장으로 따뜻하게 요약하세요. "오늘 당신은..."으로 시작하세요.`;

// ── API ───────────────────────────────────────────────────────────────────────
async function callClaude(messages, system) {
  try {
    // system 프롬프트를 첫 번째 user 메시지 앞에 삽입
    const contents = [
      { role: "user", parts: [{ text: system }] },
      { role: "model", parts: [{ text: "네, 이해했습니다." }] },
      ...messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCzUXSxWo6zuXOKFY7C_sY-e9JudUewvOU`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );
    const d = await res.json();
    return d.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch {
    return "잠시 후 다시 시도해주세요.";
  }
}

// ── Sub-components (컴포넌트 외부 선언) ──────────────────────────────────────

function DotsLoader({ color = "#C4A882" }) {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", height: 20 }}>
      {[0, 0.2, 0.4].map((d, i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color,
            display: "inline-block",
            animation: `pulse 1.2s ${d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function ChatBubbleAI({ children, color = INK, symbol = "✒" }) {
  return (
    <div
      className="ii"
      style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: color,
          color: "#F5F0E8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          flexShrink: 0,
          marginTop: 4,
        }}
      >
        {symbol}
      </div>
      <div
        style={{
          background: "white",
          border: "1px solid #EDE8DE",
          borderRadius: "4px 16px 16px 16px",
          padding: "13px 17px",
          maxWidth: "78%",
          fontFamily: SERIF,
          fontSize: 15,
          lineHeight: 1.9,
          color: INK,
          boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ChatBubbleUser({ children }) {
  return (
    <div className="ii" style={{ display: "flex", justifyContent: "flex-end" }}>
      <div
        style={{
          background: INK,
          color: "#F5F0E8",
          borderRadius: "16px 4px 16px 16px",
          padding: "12px 16px",
          maxWidth: "78%",
          fontFamily: SERIF,
          fontSize: 15,
          lineHeight: 1.9,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function EssayPaper({ title, body, date }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E8DDD0",
        borderRadius: 4,
        padding: "32px 28px",
        boxShadow: "2px 2px 0 #D4C4A820",
        backgroundImage:
          "repeating-linear-gradient(transparent,transparent 31px,#E8DDD010 31px,#E8DDD010 32px)",
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 10,
          color: "#C4A882",
          letterSpacing: "3px",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        — 에세이 —
      </div>
      <h2
        style={{
          fontFamily: SERIF,
          fontSize: 21,
          color: INK,
          fontWeight: 700,
          textAlign: "center",
          marginBottom: 20,
          lineHeight: 1.5,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontFamily: SERIF,
          fontSize: 15,
          lineHeight: 2.2,
          color: INK,
          whiteSpace: "pre-wrap",
          wordBreak: "keep-all",
        }}
      >
        {body}
      </p>
      {date && (
        <p
          style={{
            fontFamily: SANS,
            fontSize: 11,
            color: "#C4A882",
            textAlign: "right",
            marginTop: 20,
          }}
        >
          {date}
        </p>
      )}
    </div>
  );
}

function PublishCTA({ onConsult }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg,#2A2018,#4A3828)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "28px 24px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            background: "#8B6F4730",
            border: "1px solid #8B6F47",
            color: "#C4A882",
            fontSize: 10,
            padding: "4px 14px",
            borderRadius: 20,
            letterSpacing: "2px",
          }}
        >
          ✦ 출판 컨설팅
        </div>
        <h3
          style={{
            fontFamily: SERIF,
            fontSize: 20,
            color: "#F5F0E8",
            lineHeight: 1.6,
            margin: "10px 0",
          }}
        >
          이 에세이,
          <br />
          책이 될 수 있을까요?
        </h3>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 13,
            color: "#C4A882",
            lineHeight: 1.9,
            marginBottom: 18,
          }}
        >
          작가수업에 쌓인 에세이들은
          <br />한 권의 책이 될 가능성이 있습니다.
        </p>
        <button
          className="ctahover"
          onClick={onConsult}
          style={{
            background: "#C4A882",
            color: INK,
            border: "none",
            borderRadius: 4,
            padding: "12px 24px",
            fontSize: 14,
            fontFamily: SERIF,
            fontWeight: 600,
            boxShadow: "0 4px 16px rgba(196,168,130,.3)",
            transition: "transform .2s, box-shadow .2s",
          }}
        >
          출판 가능성 무료 진단받기 →
        </button>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 11,
            color: "#8B7A6A",
            marginTop: 10,
          }}
        >
          ✓ 원고 검토 &nbsp;✓ 출판사 연결 &nbsp;✓ 자비출판 패키지
        </p>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [mood, setMood] = useState(null);

  // chat
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState(0);

  // essay results
  const [essayBody, setEssayBody] = useState("");
  const [essayTitle, setEssayTitle] = useState("");

  // counsel results
  const [summary, setSummary] = useState("");
  const [counselDone, setCounselDone] = useState(false);
  const [counselEssay, setCounselEssay] = useState("");
  const [counselTitle, setCounselTitle] = useState("");

  // records (in-memory)
  const [records, setRecords] = useState([]);
  const [viewRec, setViewRec] = useState(null);

  // calendar
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  // consult form
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    intro: "",
    essayId: "",
    agree: false,
  });
  const [formSent, setFormSent] = useState(false);

  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading, counselDone]);

  // ── helpers ──────────────────────────────────────────────────────────────
  const addRecord = (title, body, moodObj, mode) => {
    const rec = {
      id: Date.now(),
      title,
      body,
      moodId: moodObj?.id,
      moodEmoji: moodObj?.emoji,
      moodLabel: moodObj?.label,
      moodColor: moodObj?.color,
      mode,
      date: new Date().toISOString(),
    };
    setRecords((prev) => [rec, ...prev]);
    return rec;
  };

  const toDate = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const today = () => {
    const n = new Date();
    return toDate(n.getFullYear(), n.getMonth(), n.getDate());
  };

  const resetChat = () => {
    setMsgs([]);
    setInput("");
    setTurns(0);
    setCounselDone(false);
    setSummary("");
  };

  // ── Essay flow ────────────────────────────────────────────────────────────
  const startEssay = async (m) => {
    setMood(m);
    resetChat();
    setScreen("writing");
    setLoading(true);
    const q = await callClaude(
      [
        {
          role: "user",
          content: `오늘 감정은 "${m.label}"입니다. 글쓰기를 시작하고 싶어요.`,
        },
      ],
      SYS_ESSAY(m.label, m.pos)
    );
    setMsgs([{ role: "assistant", content: q }]);
    setLoading(false);
  };

  const sendEssayMsg = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    const t = turns + 1;
    setTurns(t);
    const updated = [...msgs, { role: "user", content: text }];
    setMsgs(updated);
    setLoading(true);
    if (t >= 3) {
      const final = [
        ...updated,
        {
          role: "assistant",
          content: "충분히 깊이 들어왔어요. 이제 에세이로 엮어볼게요. ✍️",
        },
      ];
      setMsgs(final);
      setLoading(false);
      setTimeout(() => genEssay(final), 400);
      return;
    }
    const q = await callClaude(updated, SYS_ESSAY(mood?.label, mood?.pos));
    setMsgs([...updated, { role: "assistant", content: q }]);
    setLoading(false);
  };

  const genEssay = async (messages) => {
    setScreen("genLoading");
    const conv = messages
      .map((m) => `${m.role === "user" ? "나" : "코치"}: ${m.content}`)
      .join("\n\n");
    const [body, title] = await Promise.all([
      callClaude([{ role: "user", content: conv }], SYS_ESSAY_GEN),
      callClaude([{ role: "user", content: conv }], SYS_TITLE),
    ]);
    addRecord(title.trim(), body, mood, "essay");
    setEssayBody(body);
    setEssayTitle(title.trim());
    setScreen("essay");
  };

  // ── Counsel flow ──────────────────────────────────────────────────────────
  const startCounsel = async (m) => {
    setMood(m);
    resetChat();
    setScreen("counsel");
    setLoading(true);
    const q = await callClaude(
      [
        {
          role: "user",
          content: `오늘 감정은 "${m.label}"입니다. 이야기를 나누고 싶어요.`,
        },
      ],
      SYS_COUNSEL(m.label, m.pos)
    );
    setMsgs([{ role: "assistant", content: q }]);
    setLoading(false);
  };

  const sendCounselMsg = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    const updated = [...msgs, { role: "user", content: text }];
    setMsgs(updated);
    setLoading(true);
    setTurns((t) => t + 1);
    const q = await callClaude(updated, SYS_COUNSEL(mood?.label, mood?.pos));
    setMsgs([...updated, { role: "assistant", content: q }]);
    setLoading(false);
  };

  const endCounsel = async () => {
    setLoading(true);
    const conv = msgs
      .map((m) => `${m.role === "user" ? "내담자" : "상담사"}: ${m.content}`)
      .join("\n\n");
    const sum = await callClaude(
      [{ role: "user", content: conv }],
      SYS_SUMMARY
    );
    setSummary(sum);
    setCounselDone(true);
    setLoading(false);
  };

  const convertCounselToEssay = async () => {
    setScreen("genLoading");
    const conv = msgs
      .map((m) => `${m.role === "user" ? "나" : "상담사"}: ${m.content}`)
      .join("\n\n");
    const [body, title] = await Promise.all([
      callClaude([{ role: "user", content: conv }], SYS_COUNSEL_ESSAY),
      callClaude([{ role: "user", content: conv }], SYS_TITLE),
    ]);
    addRecord(title.trim(), body, mood, "counsel");
    setCounselEssay(body);
    setCounselTitle(title.trim());
    setScreen("counselEssay");
  };

  const handleKey = (e, fn) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      fn();
    }
  };

  // ── Calendar data ─────────────────────────────────────────────────────────
  const { y, m: cm } = calMonth;
  const calDays = new Date(y, cm + 1, 0).getDate();
  const calFirst = new Date(y, cm, 1).getDay();
  const calCells = [
    ...Array(calFirst).fill(null),
    ...Array.from({ length: calDays }, (_, i) => i + 1),
  ];
  const monthRecs = records.filter((r) => {
    const d = new Date(r.date);
    return d.getFullYear() === y && d.getMonth() === cm;
  });
  const dayRec = (day) =>
    records.find((r) => r.date.startsWith(toDate(y, cm, day)));

  // ─────────────────────────────────────────────────────────────────────────
  // SCREENS
  // ─────────────────────────────────────────────────────────────────────────

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === "home")
    return (
      <div style={S.page}>
        <div style={S.homeCard}>
          <div style={S.ruled} />
          <div
            className="fu"
            style={{ position: "relative", zIndex: 1, textAlign: "center" }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>✒</div>
            <h1
              style={{
                fontFamily: SERIF,
                fontSize: 40,
                color: INK,
                fontWeight: 700,
                letterSpacing: "-1px",
              }}
            >
              작가수업
            </h1>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 11,
                color: "#C4A882",
                letterSpacing: "4px",
                marginTop: 4,
                marginBottom: 18,
              }}
            >
              Writer's Workshop
            </p>
            <div
              style={{
                width: 36,
                height: 1,
                background: "#C4A882",
                margin: "0 auto 18px",
              }}
            />
            <p
              style={{
                fontFamily: SERIF,
                fontSize: 17,
                color: INK,
                lineHeight: 1.9,
                marginBottom: 8,
              }}
            >
              당신 안에 잠들어 있는 이야기를
              <br />
              오늘, 글로 꺼내보세요.
            </p>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 13,
                color: "#9A8A78",
                lineHeight: 1.8,
                marginBottom: 28,
              }}
            >
              에세이 쓰기와 마음 상담,
              <br />두 가지 방법으로 감정을 탐구합니다.
            </p>
            <button
              className="fu d3"
              style={S.primaryBtn}
              onClick={() => setScreen("mood")}
            >
              시작하기 →
            </button>
            <div
              className="fu d4"
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                marginTop: 16,
              }}
            >
              <button
                className="ghosthover"
                style={S.ghostBtn}
                onClick={() => setScreen("library")}
              >
                📚 보관함
                {records.length > 0 && (
                  <span style={S.badge}>{records.length}</span>
                )}
              </button>
              <button
                className="ghosthover"
                style={S.ghostBtn}
                onClick={() => setScreen("calendar")}
              >
                🗓 감정 달력
              </button>
            </div>
            <p
              className="fu d5"
              style={{
                fontFamily: SANS,
                fontSize: 11,
                color: "#C4A882",
                marginTop: 18,
                letterSpacing: "1px",
              }}
            >
              완성된 에세이, 책이 될 수 있습니다
            </p>
          </div>
        </div>
      </div>
    );

  // ── MOOD ──────────────────────────────────────────────────────────────────
  if (screen === "mood")
    return (
      <div style={S.page}>
        <div style={{ maxWidth: 500, width: "100%", padding: "0 4px" }}>
          <button style={S.backBtn} onClick={() => setScreen("home")}>
            ← 돌아가기
          </button>
          <div className="fu" style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontFamily: SERIF,
                fontSize: 21,
                color: INK,
                marginBottom: 8,
              }}
            >
              오늘, 어떤 감정과 함께인가요?
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 13, color: "#9A8A78" }}>
              감정을 선택하면 에세이 또는 상담 중 하나를 고를 수 있어요
            </p>
          </div>
          <p style={S.groupLabel}>✦ 긍정의 감정</p>
          <div style={S.moodGrid}>
            {MOODS.filter((m) => m.pos).map((mo, i) => (
              <button
                key={mo.id}
                className={`moodbtn fu d${i + 1}`}
                style={{
                  ...S.moodBtn,
                  background: mo.bg,
                  borderColor: mo.color + "55",
                }}
                onClick={() => {
                  setMood(mo);
                  setScreen("modeSelect");
                }}
              >
                <span style={{ fontSize: 26 }}>{mo.emoji}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: SANS,
                    color: mo.color,
                  }}
                >
                  {mo.label}
                </span>
              </button>
            ))}
          </div>
          <p style={{ ...S.groupLabel, marginTop: 20 }}>✦ 복잡한 감정</p>
          <div style={S.moodGrid}>
            {MOODS.filter((m) => !m.pos).map((mo, i) => (
              <button
                key={mo.id}
                className={`moodbtn fu d${i + 1}`}
                style={{
                  ...S.moodBtn,
                  background: mo.bg,
                  borderColor: mo.color + "55",
                }}
                onClick={() => {
                  setMood(mo);
                  setScreen("modeSelect");
                }}
              >
                <span style={{ fontSize: 26 }}>{mo.emoji}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: SANS,
                    color: mo.color,
                  }}
                >
                  {mo.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );

  // ── MODE SELECT ───────────────────────────────────────────────────────────
  if (screen === "modeSelect")
    return (
      <div style={S.page}>
        <div style={{ maxWidth: 420, width: "100%", padding: "0 4px" }}>
          <button style={S.backBtn} onClick={() => setScreen("mood")}>
            ← 다시 선택
          </button>
          <div className="fu" style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>{mood?.emoji}</div>
            <h2
              style={{
                fontFamily: SERIF,
                fontSize: 22,
                color: INK,
                marginBottom: 6,
              }}
            >
              {mood?.label}
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 13, color: "#9A8A78" }}>
              어떻게 감정을 탐구하고 싶으신가요?
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button
              className="fu d1 modebtn"
              style={{ ...S.modeCard, borderColor: mood?.color + "55" }}
              onClick={() => startEssay(mood)}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>✍️</div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 18,
                  color: INK,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                에세이 쓰기
              </div>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  color: "#6A5A4A",
                  lineHeight: 1.7,
                }}
              >
                AI 코치의 질문에 답하다 보면
                <br />한 편의 에세이가 완성됩니다.
              </p>
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  color: mood?.color,
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                ✦ 출판 컨설팅으로 연결
              </span>
            </button>
            <button
              className="fu d2 modebtn"
              style={{ ...S.modeCard, borderColor: mood?.color + "55" }}
              onClick={() => startCounsel(mood)}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤍</div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 18,
                  color: INK,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                마음 상담
              </div>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  color: "#6A5A4A",
                  lineHeight: 1.7,
                }}
              >
                판단 없이 들어주는 상담사와
                <br />
                자유롭게 마음을 털어놓으세요.
              </p>
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  color: mood?.color,
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                ✦ 전문 상담사 연결 가능
              </span>
            </button>
          </div>
        </div>
      </div>
    );

  // ── ESSAY WRITING ─────────────────────────────────────────────────────────
  if (screen === "writing")
    return (
      <div style={S.chatPage}>
        <div style={S.chatBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 17,
                color: INK,
                fontWeight: 700,
              }}
            >
              작가수업
            </span>
            <Chip bg={mood?.bg} color={mood?.color}>
              {mood?.emoji} {mood?.label}
            </Chip>
            <Chip bg="#EEF5E8" color="#4A7A3A">
              ✍️ 에세이
            </Chip>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  transition: "background .3s",
                  background: turns >= n ? mood?.color : "#D4C4A8",
                }}
              />
            ))}
            <span style={{ fontSize: 11, color: "#9A8A78", marginLeft: 3 }}>
              {turns}/3
            </span>
          </div>
        </div>
        <div style={S.chatScroll}>
          {msgs.map((msg, i) =>
            msg.role === "assistant" ? (
              <ChatBubbleAI key={i}>{msg.content}</ChatBubbleAI>
            ) : (
              <ChatBubbleUser key={i}>{msg.content}</ChatBubbleUser>
            )
          )}
          {loading && (
            <ChatBubbleAI>
              <DotsLoader />
            </ChatBubbleAI>
          )}
          <div ref={bottomRef} />
        </div>
        {!loading && msgs.length > 0 && turns < 3 && (
          <div style={S.inputBar} className="fi">
            <textarea
              className="ta"
              style={S.textarea}
              rows={4}
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => handleKey(e, sendEssayMsg)}
              placeholder="느끼는 것을 자유롭게 써주세요..."
            />
            <button
              style={{
                ...S.sendBtn,
                background: mood?.color,
                opacity: input.trim() ? 1 : 0.4,
              }}
              onClick={sendEssayMsg}
              disabled={!input.trim()}
            >
              다음 →
            </button>
          </div>
        )}
      </div>
    );

  // ── COUNSEL ───────────────────────────────────────────────────────────────
  if (screen === "counsel")
    return (
      <div style={S.chatPage}>
        <div style={S.chatBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 17,
                color: INK,
                fontWeight: 700,
              }}
            >
              작가수업
            </span>
            <Chip bg={mood?.bg} color={mood?.color}>
              {mood?.emoji} {mood?.label}
            </Chip>
            <Chip bg="#F4EEF8" color="#9B7FA3">
              🤍 상담
            </Chip>
          </div>
          {turns >= 2 && !loading && !counselDone && (
            <button
              className="ghosthover"
              style={{ ...S.ghostBtn, fontSize: 12, padding: "6px 14px" }}
              onClick={endCounsel}
            >
              상담 마무리
            </button>
          )}
        </div>
        <div style={S.chatScroll}>
          {msgs.map((msg, i) =>
            msg.role === "assistant" ? (
              <ChatBubbleAI key={i} color="#9B7FA3" symbol="🤍">
                {msg.content}
              </ChatBubbleAI>
            ) : (
              <ChatBubbleUser key={i}>{msg.content}</ChatBubbleUser>
            )
          )}
          {loading && (
            <ChatBubbleAI color="#9B7FA3" symbol="🤍">
              <DotsLoader color="#C4A882" />
            </ChatBubbleAI>
          )}

          {counselDone && (
            <div className="ii">
              {summary && (
                <div
                  style={{
                    background: "linear-gradient(135deg,#FAF8FF,white)",
                    border: "1px solid #E4DAF0",
                    borderRadius: "4px 16px 16px 16px",
                    padding: "16px 18px",
                    marginLeft: 42,
                    marginBottom: 12,
                    fontFamily: SERIF,
                    fontSize: 14,
                    lineHeight: 1.9,
                    color: INK,
                  }}
                >
                  <p
                    style={{
                      fontFamily: SANS,
                      fontSize: 10,
                      color: "#9B7FA3",
                      letterSpacing: "2px",
                      marginBottom: 8,
                    }}
                  >
                    — 오늘의 상담 요약 —
                  </p>
                  {summary}
                </div>
              )}
              <div
                style={{
                  background: "white",
                  border: "1px solid #E4DAF0",
                  borderRadius: 12,
                  padding: "18px 20px",
                  marginLeft: 42,
                }}
              >
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: 15,
                    color: INK,
                    marginBottom: 12,
                    lineHeight: 1.7,
                  }}
                >
                  오늘의 이야기를
                  <br />
                  <strong>에세이로 남겨볼까요?</strong>
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    style={{
                      ...S.primaryBtn,
                      fontSize: 13,
                      padding: "10px 18px",
                    }}
                    onClick={convertCounselToEssay}
                  >
                    에세이로 변환하기 ✍️
                  </button>
                  <button
                    className="ghosthover"
                    style={S.ghostBtn}
                    onClick={() => setScreen("proConsult")}
                  >
                    전문 상담사 연결 →
                  </button>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {!loading && !counselDone && (
          <div style={S.inputBar} className="fi">
            <textarea
              className="ta"
              style={S.textarea}
              rows={3}
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => handleKey(e, sendCounselMsg)}
              placeholder="마음에 있는 것을 자유롭게 적어주세요..."
            />
            <button
              style={{
                ...S.sendBtn,
                background: "#9B7FA3",
                opacity: input.trim() ? 1 : 0.4,
              }}
              onClick={sendCounselMsg}
              disabled={!input.trim()}
            >
              전송
            </button>
          </div>
        )}
      </div>
    );

  // ── GEN LOADING ───────────────────────────────────────────────────────────
  if (screen === "genLoading")
    return (
      <div style={{ ...S.page, flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 44, animation: "pulse 1.4s infinite" }}>✒</div>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: "#9A8A78" }}>
          당신의 이야기를 에세이로 엮고 있어요...
        </p>
      </div>
    );

  // ── ESSAY ─────────────────────────────────────────────────────────────────
  if (screen === "essay")
    return (
      <div style={{ minHeight: "100vh", background: CREAM, paddingBottom: 60 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px" }}>
          <TopBar
            left={
              <button style={S.backBtn} onClick={() => setScreen("mood")}>
                ← 새 에세이
              </button>
            }
            right={
              <Chip bg={mood?.bg} color={mood?.color}>
                {mood?.emoji} {mood?.label}
              </Chip>
            }
          />
          <div className="fu">
            <EssayPaper
              title={essayTitle}
              body={essayBody}
              date={new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          </div>
          <div
            className="fu d1"
            style={{ display: "flex", gap: 10, margin: "14px 0" }}
          >
            <button
              className="ghosthover"
              style={S.outlineBtn}
              onClick={() => navigator.clipboard?.writeText(essayBody)}
            >
              📋 복사
            </button>
            <button
              className="ghosthover"
              style={S.outlineBtn}
              onClick={() => setScreen("library")}
            >
              📚 보관함
            </button>
            <button
              className="ghosthover"
              style={S.outlineBtn}
              onClick={() => setScreen("mood")}
            >
              ✍️ 새 에세이
            </button>
          </div>
          <div className="fu d2">
            <PublishCTA onConsult={() => setScreen("consult")} />
          </div>
        </div>
      </div>
    );

  // ── COUNSEL ESSAY ─────────────────────────────────────────────────────────
  if (screen === "counselEssay")
    return (
      <div style={{ minHeight: "100vh", background: CREAM, paddingBottom: 60 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px" }}>
          <TopBar
            left={
              <button style={S.backBtn} onClick={() => setScreen("counsel")}>
                ← 상담으로
              </button>
            }
            right={
              <Chip bg={mood?.bg} color={mood?.color}>
                {mood?.emoji} {mood?.label}
              </Chip>
            }
          />
          <div className="fu">
            <EssayPaper
              title={counselTitle}
              body={counselEssay}
              date={new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          </div>
          <div
            className="fu d1"
            style={{ display: "flex", gap: 10, margin: "14px 0" }}
          >
            <button
              className="ghosthover"
              style={S.outlineBtn}
              onClick={() => navigator.clipboard?.writeText(counselEssay)}
            >
              📋 복사
            </button>
            <button
              className="ghosthover"
              style={S.outlineBtn}
              onClick={() => setScreen("library")}
            >
              📚 보관함
            </button>
          </div>
          <div className="fu d2">
            <PublishCTA onConsult={() => setScreen("consult")} />
          </div>
        </div>
      </div>
    );

  // ── LIBRARY ───────────────────────────────────────────────────────────────
  if (screen === "library")
    return (
      <div style={{ minHeight: "100vh", background: CREAM, paddingBottom: 60 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px" }}>
          <TopBar
            left={
              <button style={S.backBtn} onClick={() => setScreen("home")}>
                ← 홈
              </button>
            }
            center={
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 18,
                  color: INK,
                  fontWeight: 700,
                }}
              >
                나의 에세이 보관함
              </span>
            }
            right={
              <span
                style={{ fontFamily: SANS, fontSize: 13, color: "#9A8A78" }}
              >
                {records.length}편
              </span>
            }
          />
          {records.length === 0 ? (
            <div style={{ textAlign: "center", padding: "70px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📄</div>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: 16,
                  color: "#9A8A78",
                  marginBottom: 20,
                }}
              >
                아직 완성된 에세이가 없어요
              </p>
              <button style={S.primaryBtn} onClick={() => setScreen("mood")}>
                첫 에세이 쓰기
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {records.map((r, i) => {
                const mo = getMood(r.moodId);
                return (
                  <div
                    key={r.id}
                    className={`cardhover fu d${Math.min(i + 1, 6)}`}
                    style={S.libCard}
                    onClick={() => {
                      setViewRec(r);
                      setScreen("viewRec");
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ display: "flex", gap: 6 }}>
                        <Chip bg={mo?.bg || "#F5F0E8"} color={r.moodColor}>
                          {r.moodEmoji} {r.moodLabel}
                        </Chip>
                        <Chip
                          bg={r.mode === "counsel" ? "#F4EEF8" : "#EEF5E8"}
                          color={r.mode === "counsel" ? "#9B7FA3" : "#4A7A3A"}
                          size={10}
                        >
                          {r.mode === "counsel" ? "🤍 상담" : "✍️ 에세이"}
                        </Chip>
                      </div>
                      <span
                        style={{
                          fontFamily: SANS,
                          fontSize: 11,
                          color: "#9A8A78",
                        }}
                      >
                        {new Date(r.date).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: SERIF,
                        fontSize: 16,
                        color: INK,
                        marginBottom: 6,
                      }}
                    >
                      {r.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: SERIF,
                        fontSize: 13,
                        color: "#6A5A4A",
                        lineHeight: 1.7,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {r.body}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );

  // ── VIEW RECORD ───────────────────────────────────────────────────────────
  if (screen === "viewRec" && viewRec) {
    const mo = getMood(viewRec.moodId);
    return (
      <div style={{ minHeight: "100vh", background: CREAM, paddingBottom: 60 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px" }}>
          <TopBar
            left={
              <button style={S.backBtn} onClick={() => setScreen("library")}>
                ← 보관함
              </button>
            }
            center={
              <Chip bg={mo?.bg || "#F5F0E8"} color={viewRec.moodColor}>
                {viewRec.moodEmoji} {viewRec.moodLabel}
              </Chip>
            }
            right={
              <span
                style={{ fontFamily: SANS, fontSize: 11, color: "#9A8A78" }}
              >
                {new Date(viewRec.date).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            }
          />
          <div className="fu">
            <EssayPaper title={viewRec.title} body={viewRec.body} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button
              className="ghosthover"
              style={S.outlineBtn}
              onClick={() => navigator.clipboard?.writeText(viewRec.body)}
            >
              📋 복사
            </button>
            <button
              className="ghosthover"
              style={S.outlineBtn}
              onClick={() => setScreen("consult")}
            >
              📮 출판 상담
            </button>
            <button
              className="ghosthover"
              style={{
                ...S.outlineBtn,
                color: "#C46060",
                borderColor: "#E8C4C4",
              }}
              onClick={() => {
                if (!confirm("삭제할까요?")) return;
                setRecords((prev) => prev.filter((r) => r.id !== viewRec.id));
                setScreen("library");
              }}
            >
              🗑 삭제
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CALENDAR ──────────────────────────────────────────────────────────────
  if (screen === "calendar") {
    const moodStat = MOODS.reduce(
      (a, mo) => ({
        ...a,
        [mo.id]: monthRecs.filter((r) => r.moodId === mo.id).length,
      }),
      {}
    );
    return (
      <div style={{ minHeight: "100vh", background: CREAM, paddingBottom: 60 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
          <TopBar
            left={
              <button style={S.backBtn} onClick={() => setScreen("home")}>
                ← 홈
              </button>
            }
            center={
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 18,
                  color: INK,
                  fontWeight: 700,
                }}
              >
                감정 달력
              </span>
            }
            right={
              <span
                style={{ fontFamily: SANS, fontSize: 13, color: "#9A8A78" }}
              >
                {monthRecs.length}편
              </span>
            }
          />
          <div
            className="fu"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0 16px",
            }}
          >
            <button
              style={S.calNavBtn}
              onClick={() =>
                setCalMonth((p) => {
                  const n = p.m - 1;
                  return n < 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m: n };
                })
              }
            >
              ‹
            </button>
            <span style={{ fontFamily: SERIF, fontSize: 19, color: INK }}>
              {y}년 {cm + 1}월
            </span>
            <button
              style={S.calNavBtn}
              onClick={() =>
                setCalMonth((p) => {
                  const n = p.m + 1;
                  return n > 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m: n };
                })
              }
            >
              ›
            </button>
          </div>
          <div
            className="fu d1"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              gap: 4,
              marginBottom: 20,
            }}
          >
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <div
                key={d}
                style={{
                  fontFamily: SANS,
                  fontSize: 11,
                  color: "#9A8A78",
                  textAlign: "center",
                  padding: "5px 0",
                  fontWeight: 600,
                }}
              >
                {d}
              </div>
            ))}
            {calCells.map((day, i) => {
              if (!day) return <div key={`x${i}`} />;
              const rec = dayRec(day);
              const isToday = toDate(y, cm, day) === today();
              return (
                <div
                  key={day}
                  style={{
                    minHeight: 50,
                    borderRadius: 8,
                    transition: "background .15s",
                    background: isToday ? INK : "white",
                    border: `1px solid ${isToday ? INK : "#EDE8DE"}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    padding: 4,
                    cursor: rec ? "pointer" : "default",
                  }}
                  onClick={() => {
                    if (rec) {
                      setViewRec(rec);
                      setScreen("viewRec");
                    }
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: isToday ? "#F5F0E8" : "#6A5A4A",
                    }}
                  >
                    {day}
                  </span>
                  {rec && (
                    <span style={{ fontSize: 15, lineHeight: 1 }}>
                      {rec.moodEmoji}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {monthRecs.length > 0 && (
            <div
              className="fu d2"
              style={{
                background: "white",
                border: "1px solid #E8DDD0",
                borderRadius: 12,
                padding: "18px 20px",
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 11,
                  color: "#9A8A78",
                  letterSpacing: "1px",
                  marginBottom: 12,
                }}
              >
                이달의 감정 분포
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MOODS.filter((mo) => moodStat[mo.id] > 0).map((mo) => (
                  <div
                    key={mo.id}
                    style={{
                      fontSize: 13,
                      padding: "5px 12px",
                      borderRadius: 20,
                      fontFamily: SANS,
                      background: mo.bg,
                      color: mo.color,
                      fontWeight: 500,
                    }}
                  >
                    {mo.emoji} {mo.label} <strong>{moodStat[mo.id]}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          {monthRecs.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: 15,
                  color: "#9A8A78",
                  marginBottom: 16,
                }}
              >
                이달에 작성된 기록이 없어요
              </p>
              <button style={S.primaryBtn} onClick={() => setScreen("mood")}>
                오늘 시작하기
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── CONSULT (출판) ─────────────────────────────────────────────────────────
  if (screen === "consult")
    return (
      <ConsultForm
        title="출판 컨설팅 신청"
        accentColor={BROWN}
        mood={mood}
        records={records}
        form={form}
        setForm={setForm}
        formSent={formSent}
        setFormSent={setFormSent}
        onBack={() => setScreen("home")}
        onHome={() => setScreen("home")}
        submitLabel="무료 상담 신청하기"
        sentMsg="담당 에디터가 48시간 내에 연락드립니다"
        steps={[
          ["1단계", "원고 검토", "완성된 에세이 전체 검토 및 피드백"],
          ["2단계", "출판 방향 설계", "독립출판 / 출판사 투고 전략 수립"],
          ["3단계", "작가 데뷔", "출판사 연결 또는 자비출판 지원"],
        ]}
      />
    );

  // ── PRO CONSULT (전문 상담사) ──────────────────────────────────────────────
  if (screen === "proConsult")
    return (
      <div style={{ minHeight: "100vh", background: CREAM, paddingBottom: 60 }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 20px" }}>
          <TopBar
            left={
              <button style={S.backBtn} onClick={() => setScreen("counsel")}>
                ← 돌아가기
              </button>
            }
            center={
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 18,
                  color: INK,
                  fontWeight: 700,
                }}
              >
                전문 상담사 연결
              </span>
            }
            right={<span />}
          />

          {formSent ? (
            <div
              className="fu"
              style={{ textAlign: "center", padding: "56px 0" }}
            >
              <div
                style={{
                  fontSize: 54,
                  marginBottom: 18,
                  animation: "pop .5s ease",
                }}
              >
                💌
              </div>
              <h3
                style={{
                  fontFamily: SERIF,
                  fontSize: 22,
                  color: INK,
                  marginBottom: 10,
                }}
              >
                신청이 완료되었습니다!
              </h3>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 14,
                  color: "#6A5A4A",
                  lineHeight: 1.9,
                  marginBottom: 28,
                }}
              >
                담당 상담사가 <strong>24시간 내</strong>에<br />
                연락드립니다.
              </p>
              <button style={S.primaryBtn} onClick={() => setScreen("home")}>
                홈으로 돌아가기
              </button>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {[
                  {
                    name: "김지연 상담사",
                    spec: "불안·우울·관계",
                    career: "임상심리사 10년",
                    color: "#9B7FA3",
                    bg: "#F4EEF8",
                  },
                  {
                    name: "박민준 상담사",
                    spec: "자존감·진로·성장",
                    career: "상담심리사 7년",
                    color: "#4A8A5A",
                    bg: "#EAF3EC",
                  },
                  {
                    name: "이수아 상담사",
                    spec: "감정조절·트라우마",
                    career: "정신건강전문가 9년",
                    color: "#7A8EB8",
                    bg: "#EEF0F8",
                  },
                ].map((c, i) => (
                  <div
                    key={i}
                    className={`fu d${i + 1}`}
                    style={{
                      background: "white",
                      border: `1.5px solid ${c.color}33`,
                      borderRadius: 12,
                      padding: "16px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: c.bg,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      🤍
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: SERIF,
                          fontSize: 15,
                          color: INK,
                          fontWeight: 700,
                          marginBottom: 2,
                        }}
                      >
                        {c.name}
                      </div>
                      <div
                        style={{
                          fontFamily: SANS,
                          fontSize: 12,
                          color: c.color,
                          marginBottom: 1,
                        }}
                      >
                        {c.spec}
                      </div>
                      <div
                        style={{
                          fontFamily: SANS,
                          fontSize: 11,
                          color: "#9A8A78",
                        }}
                      >
                        {c.career}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize: 11,
                        color: "#C4A882",
                        textAlign: "right",
                      }}
                    >
                      첫 상담
                      <br />
                      <strong style={{ color: INK }}>무료</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="fu d3" style={S.formCard}>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontSize: 17,
                    color: INK,
                    marginBottom: 4,
                  }}
                >
                  상담 연결 신청
                </h3>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 12,
                    color: "#9A8A78",
                    marginBottom: 16,
                  }}
                >
                  오늘 나눈 감정을 바탕으로 맞춤 상담사를 연결해드립니다
                </p>
                {[
                  ["이름", "name", "홍길동", "text", true],
                  ["이메일", "email", "example@email.com", "email", true],
                  ["연락처", "phone", "010-0000-0000", "tel", false],
                ].map(([l, k, ph, t, req]) => (
                  <div key={k}>
                    <label style={S.fLabel}>
                      {l}{" "}
                      {req ? (
                        <span style={{ color: "#C46060" }}>*</span>
                      ) : (
                        <span style={{ color: "#9A8A78", fontSize: 11 }}>
                          (선택)
                        </span>
                      )}
                    </label>
                    <input
                      className="finput"
                      style={S.fInput}
                      type={t}
                      placeholder={ph}
                      value={form[k]}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, [k]: e.target.value }))
                      }
                    />
                  </div>
                ))}
                <label style={S.fLabel}>
                  상담 희망 주제{" "}
                  <span style={{ color: "#9A8A78", fontSize: 11 }}>(선택)</span>
                </label>
                <textarea
                  className="finput ta"
                  style={{ ...S.fInput, height: 80, resize: "none" }}
                  placeholder="이야기하고 싶은 주제를 적어주세요..."
                  value={form.intro}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, intro: e.target.value }))
                  }
                />
                {mood && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "10px 14px",
                      background: mood.bg,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{mood.emoji}</span>
                    <span
                      style={{
                        fontFamily: SANS,
                        fontSize: 12,
                        color: mood.color,
                      }}
                    >
                      오늘의 감정 <strong>{mood.label}</strong>이 상담사에게
                      전달됩니다
                    </span>
                  </div>
                )}
                <AgreeLine
                  color="#9B7FA3"
                  agree={form.agree}
                  onChange={(v) => setForm((p) => ({ ...p, agree: v }))}
                  text="입력 정보를 전문 상담 연결 목적으로 수집·이용하는 것에 동의합니다."
                />
                <button
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 4,
                    padding: "14px",
                    fontSize: 15,
                    fontFamily: SERIF,
                    transition: "background .2s",
                    color: "#F5F0E8",
                    background:
                      form.name && form.email && form.agree
                        ? "#9B7FA3"
                        : "#C4B49A",
                    cursor:
                      form.name && form.email && form.agree
                        ? "pointer"
                        : "not-allowed",
                  }}
                  onClick={() => {
                    if (form.name && form.email && form.agree)
                      setFormSent(true);
                  }}
                >
                  전문 상담사 연결 신청하기
                </button>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 11,
                    color: "#9A8A78",
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  ✓ 첫 상담 무료 &nbsp;✓ 24시간 내 연락 &nbsp;✓ 비밀 보장
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );

  return null;
}

// ── Reusable Mini Components ───────────────────────────────────────────────────

function Chip({ bg, color, children, size = 12 }) {
  return (
    <span
      style={{
        fontSize: size,
        padding: "4px 10px",
        borderRadius: 20,
        fontWeight: 600,
        fontFamily: "'Noto Sans KR',sans-serif",
        background: bg,
        color,
      }}
    >
      {children}
    </span>
  );
}

function TopBar({ left, center, right }) {
  return (
    <div
      style={{
        padding: "16px 0 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #D4C4A8",
        marginBottom: 20,
      }}
    >
      {left || <span />}
      {center || <span />}
      {right || <span />}
    </div>
  );
}

function AgreeLine({ color, agree, onChange, text }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        margin: "14px 0 18px",
        cursor: "pointer",
      }}
      onClick={() => onChange(!agree)}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          flexShrink: 0,
          marginTop: 1,
          border: `2px solid ${agree ? color : "#D4C4A8"}`,
          background: agree ? color : "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .2s",
        }}
      >
        {agree && (
          <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>
            ✓
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: "'Noto Sans KR',sans-serif",
          fontSize: 12,
          color: "#6A5A4A",
          lineHeight: 1.6,
        }}
      >
        {text} <span style={{ color: "#C46060" }}>*</span>
      </span>
    </div>
  );
}

function ConsultForm({
  title,
  accentColor,
  mood,
  records,
  form,
  setForm,
  formSent,
  setFormSent,
  onBack,
  onHome,
  submitLabel,
  sentMsg,
  steps,
}) {
  return (
    <div style={{ minHeight: "100vh", background: CREAM, paddingBottom: 60 }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 20px" }}>
        <TopBar
          left={
            <button style={S.backBtn} onClick={onBack}>
              ← 돌아가기
            </button>
          }
          center={
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 18,
                color: INK,
                fontWeight: 700,
              }}
            >
              {title}
            </span>
          }
          right={<span />}
        />
        {formSent ? (
          <div
            className="fu"
            style={{ textAlign: "center", padding: "56px 0" }}
          >
            <div
              style={{
                fontSize: 54,
                marginBottom: 18,
                animation: "pop .5s ease",
              }}
            >
              ✉️
            </div>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 22,
                color: INK,
                marginBottom: 10,
              }}
            >
              신청이 완료되었습니다!
            </h3>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 14,
                color: "#6A5A4A",
                lineHeight: 1.9,
                marginBottom: 28,
              }}
            >
              {sentMsg}
            </p>
            <button style={S.primaryBtn} onClick={onHome}>
              홈으로 돌아가기
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              {steps.map(([s, t, d], i) => (
                <div
                  key={i}
                  className={`fu d${i + 1}`}
                  style={{
                    background: "white",
                    border: "1px solid #E8DDD0",
                    borderRadius: 8,
                    padding: "13px 18px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: 10,
                      color: accentColor,
                      fontWeight: 700,
                      letterSpacing: "1px",
                      whiteSpace: "nowrap",
                      paddingTop: 2,
                    }}
                  >
                    {s}
                  </span>
                  <div>
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontSize: 14,
                        color: INK,
                        marginBottom: 3,
                      }}
                    >
                      {t}
                    </div>
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize: 12,
                        color: "#9A8A78",
                      }}
                    >
                      {d}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="fu d3" style={S.formCard}>
              <h3
                style={{
                  fontFamily: SERIF,
                  fontSize: 17,
                  color: INK,
                  marginBottom: 16,
                }}
              >
                상담 신청서
              </h3>
              {[
                ["이름", "name", "홍길동", "text", true],
                ["이메일", "email", "example@email.com", "email", true],
                ["연락처", "phone", "010-0000-0000", "tel", false],
              ].map(([l, k, ph, t, req]) => (
                <div key={k}>
                  <label style={S.fLabel}>
                    {l}{" "}
                    {req ? (
                      <span style={{ color: "#C46060" }}>*</span>
                    ) : (
                      <span style={{ color: "#9A8A78", fontSize: 11 }}>
                        (선택)
                      </span>
                    )}
                  </label>
                  <input
                    className="finput"
                    style={S.fInput}
                    type={t}
                    placeholder={ph}
                    value={form[k]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [k]: e.target.value }))
                    }
                  />
                </div>
              ))}
              <label style={S.fLabel}>
                책 소개{" "}
                <span style={{ color: "#9A8A78", fontSize: 11 }}>(선택)</span>
              </label>
              <textarea
                className="finput ta"
                style={{ ...S.fInput, height: 80, resize: "none" }}
                placeholder="어떤 이야기를 담고 싶은지..."
                value={form.intro}
                onChange={(e) =>
                  setForm((p) => ({ ...p, intro: e.target.value }))
                }
              />
              {records.length > 0 && (
                <>
                  <label style={S.fLabel}>
                    첨부 에세이{" "}
                    <span style={{ color: "#9A8A78", fontSize: 11 }}>
                      (선택)
                    </span>
                  </label>
                  <select
                    className="finput"
                    style={{ ...S.fInput, cursor: "pointer" }}
                    value={form.essayId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, essayId: e.target.value }))
                    }
                  >
                    <option value="">선택 안 함</option>
                    {records.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <AgreeLine
                color={accentColor}
                agree={form.agree}
                onChange={(v) => setForm((p) => ({ ...p, agree: v }))}
                text="입력 정보를 출판 컨설팅 목적으로 수집·이용하는 것에 동의합니다."
              />
              <button
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 4,
                  padding: "14px",
                  fontSize: 15,
                  fontFamily: SERIF,
                  transition: "background .2s",
                  color: "#F5F0E8",
                  background:
                    form.name && form.email && form.agree ? INK : "#C4B49A",
                  cursor:
                    form.name && form.email && form.agree
                      ? "pointer"
                      : "not-allowed",
                }}
                onClick={() => {
                  if (form.name && form.email && form.agree) setFormSent(true);
                }}
              >
                {submitLabel}
              </button>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 11,
                  color: "#9A8A78",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                담당 에디터가 48시간 내에 연락드립니다
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: CREAM,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  homeCard: {
    position: "relative",
    maxWidth: 430,
    width: "100%",
    background: "white",
    borderRadius: 4,
    boxShadow: "4px 4px 0 #D4C4A8, 8px 8px 0 #C4B49022",
    padding: "52px 38px 44px",
    overflow: "hidden",
    border: "1px solid #E8DDD0",
  },
  ruled: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    backgroundImage:
      "repeating-linear-gradient(transparent,transparent 31px,#D4C4A810 31px,#D4C4A810 32px)",
  },
  primaryBtn: {
    background: INK,
    color: "#F5F0E8",
    border: "none",
    borderRadius: 2,
    padding: "13px 28px",
    fontSize: 15,
    fontFamily: SERIF,
    letterSpacing: ".5px",
  },
  ghostBtn: {
    background: "none",
    border: "1px solid #D4C4A8",
    borderRadius: 20,
    padding: "8px 16px",
    fontSize: 12,
    fontFamily: SANS,
    color: BROWN,
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },
  badge: {
    background: BROWN,
    color: "white",
    borderRadius: 10,
    padding: "1px 7px",
    fontSize: 11,
    fontWeight: 700,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#9A8A78",
    fontSize: 13,
    fontFamily: SANS,
    padding: "0 0 14px",
    display: "block",
  },
  groupLabel: {
    fontFamily: SANS,
    fontSize: 11,
    color: BROWN,
    letterSpacing: "2px",
    fontWeight: 600,
    marginBottom: 10,
  },
  moodGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 },
  moodBtn: {
    border: "1.5px solid",
    borderRadius: 12,
    padding: "16px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    transition: "transform .2s, box-shadow .2s",
    boxShadow: "0 2px 8px rgba(0,0,0,.05)",
  },
  modeCard: {
    background: "white",
    border: "2px solid",
    borderRadius: 16,
    padding: "26px 22px",
    textAlign: "center",
    transition: "opacity .2s",
    boxShadow: "0 2px 12px rgba(0,0,0,.05)",
  },
  chatPage: {
    minHeight: "100vh",
    background: "#FDFAF5",
    display: "flex",
    flexDirection: "column",
    maxWidth: 640,
    margin: "0 auto",
  },
  chatBar: {
    padding: "12px 18px",
    borderBottom: "1px solid #EDE8DE",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "white",
    flexShrink: 0,
  },
  chatScroll: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  inputBar: {
    padding: "12px 18px",
    background: "white",
    borderTop: "1px solid #EDE8DE",
    flexShrink: 0,
  },
  textarea: {
    width: "100%",
    border: "1px solid #D4C4A8",
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 15,
    fontFamily: SERIF,
    color: INK,
    background: "#FDFAF5",
    resize: "none",
    marginBottom: 8,
  },
  sendBtn: {
    float: "right",
    color: "white",
    border: "none",
    borderRadius: 4,
    padding: "10px 20px",
    fontSize: 14,
    fontFamily: SANS,
    fontWeight: 500,
  },
  outlineBtn: {
    flex: 1,
    background: "white",
    border: "1px solid #D4C4A8",
    borderRadius: 4,
    padding: "11px 6px",
    fontSize: 13,
    fontFamily: SANS,
    color: BROWN,
    transition: "background .15s",
  },
  libCard: {
    background: "white",
    border: "1px solid #E8DDD0",
    borderRadius: 8,
    padding: "18px 20px",
    cursor: "pointer",
    transition: "transform .2s, box-shadow .2s",
    boxShadow: "0 2px 8px rgba(0,0,0,.04)",
  },
  calNavBtn: {
    background: "none",
    border: "none",
    fontSize: 26,
    color: BROWN,
    padding: "0 10px",
  },
  formCard: {
    background: "white",
    border: "1px solid #E8DDD0",
    borderRadius: 8,
    padding: "22px 20px",
    marginBottom: 20,
  },
  fLabel: {
    display: "block",
    fontFamily: SANS,
    fontSize: 12,
    color: "#6A5A4A",
    fontWeight: 600,
    marginBottom: 5,
    marginTop: 14,
  },
  fInput: {
    width: "100%",
    border: "1px solid #D4C4A8",
    borderRadius: 6,
    padding: "10px 13px",
    fontSize: 14,
    fontFamily: SANS,
    color: INK,
    background: "#FDFAF5",
    transition: "border-color .2s",
  },
};
