import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";

const stages = [
  {
    id: 0,
    emoji: "😵‍💫",
    title: "Lost in the Visa Maze",
    desc: "I don't know where to start… DS-160, I-20, F-1, B-2 — what does any of this even mean?",
    bubbleLines: ["Which visa do I need?", "How long does it take?", "What documents?"],
    bg: "from-orange-50 to-white",
    accent: "#f97316",
    mood: "confused",
  },
  {
    id: 1,
    emoji: "💬",
    title: "Thomas to the Rescue",
    desc: "Thomas breaks it all down — step-by-step, tailored to your situation, in plain English.",
    bubbleLines: ["Thomas: Based on your purpose, you need an F-1 student visa.", "Thomas: Here's your document checklist ✅", "Thomas: Your interview is likely in 3-4 weeks."],
    bg: "from-white to-orange-50",
    accent: "#ea580c",
    mood: "chatting",
  },
  {
    id: 2,
    emoji: "🥳",
    title: "VISA Approved! Dream Unlocked.",
    desc: "With Thomas's guidance, you sailed through the process — and now America awaits!",
    bubbleLines: ["My visa got approved!", "Thomas made it SO easy!", "The American dream is real! 🦅"],
    bg: "from-orange-50 to-amber-50",
    accent: "#f97316",
    mood: "happy",
  },
];

function ConfusedPerson() {
  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        style={{ fontSize: 96, lineHeight: 1 }}
      >
        😵‍💫
      </motion.div>
      {/* Floating question marks */}
      {["?", "?!", "??"].map((q, i) => (
        <motion.span
          key={i}
          className="absolute text-orange-400 select-none pointer-events-none"
          style={{ fontSize: 20 + i * 4, top: -20 - i * 18, left: 60 + i * 30 }}
          animate={{ y: [0, -12, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5 + i * 0.4, delay: i * 0.3 }}
        >
          {q}
        </motion.span>
      ))}
      {/* Stacked confusing docs */}
      <div className="mt-4 flex gap-2">
        {["DS-160", "I-20", "B-2", "F-1"].map((doc, i) => (
          <motion.div
            key={doc}
            className="px-2 py-1 rounded border border-orange-200 bg-white text-orange-500 text-xs shadow-sm"
            animate={{ rotate: [-3 + i * 2, 3 - i * 2, -3 + i * 2] }}
            transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.2 }}
          >
            {doc}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ChattingPerson() {
  const messages = [
    { from: "user", text: "Which visa do I need for my master's?" },
    { from: "thomas", text: "For a master's degree you'll need an F-1 student visa. Let me walk you through it!" },
    { from: "user", text: "What documents do I need?" },
    { from: "thomas", text: "I-20, DS-160 form, passport, bank statements, and an acceptance letter ✅" },
  ];
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((c) => (c < messages.length ? c + 1 : c));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex items-end gap-3">
        <motion.div style={{ fontSize: 72 }} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          🧑‍💻
        </motion.div>
        <div className="text-4xl">💬</div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="rounded-full bg-orange-100 p-2 overflow-hidden"
          style={{ width: 88, height: 88 }}
        >
          <img src="/thomas.png" alt="Thomas" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
        </motion.div>
      </div>
      <div className="w-full space-y-2 max-h-52 overflow-hidden">
        {messages.slice(0, visibleCount).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-2xl text-sm max-w-[75%] shadow-sm ${
                msg.from === "user"
                  ? "bg-orange-500 text-white rounded-br-sm"
                  : "bg-white border border-orange-100 text-gray-700 rounded-bl-sm"
              }`}
            >
              {msg.from === "thomas" && (
                <span className="text-orange-500 font-semibold text-xs block mb-0.5">Thomas</span>
              )}
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function HappyPerson() {
  return (
      <div className="relative flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
        <motion.div
          style={{ fontSize: 96, lineHeight: 1 }}
          animate={{ scale: [1, 1.15, 1], rotate: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          🥳
        </motion.div>
        {["🎉", "🎊", "⭐", "🦅", "✨"].map((c, i) => (
          <motion.span
            key={i}
            className="absolute select-none pointer-events-none"
            style={{ fontSize: 18, top: -10 + i * 5, left: 10 + i * 18 }}
            animate={{
              y: [0, -20 - i * 5, 0],
              x: [0, (i % 2 === 0 ? 1 : -1) * (8 + i * 4), 0],
              opacity: [1, 1, 0.6],
              rotate: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
            }}
            transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.2 }}
          >
            {c}
          </motion.span>
        ))}
      </div>
      <motion.div
        className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg text-center"
        animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 0 0 rgba(249,115,22,0.4)", "0 0 0 16px rgba(249,115,22,0)", "0 0 0 0 rgba(249,115,22,0)"] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <p className="font-bold text-lg">VISA APPROVED! ✅</p>
        <p className="text-orange-100 text-sm">The American dream awaits 🇺🇸</p>
      </motion.div>
    </div>
  );
}

function StageCard({ stage, isActive }: { stage: (typeof stages)[0]; isActive: boolean }) {
  return (
    <motion.div
      className={`rounded-3xl p-8 md:p-12 bg-gradient-to-br ${stage.bg} border border-orange-100 shadow-xl overflow-hidden relative`}
      animate={{ opacity: isActive ? 1 : 0.35, scale: isActive ? 1 : 0.97 }}
      transition={{ duration: 0.5 }}
    >
      {/* Step label */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
          {stage.id + 1}
        </div>
        <span className="text-orange-500 font-semibold text-sm tracking-wide uppercase">
          {stage.mood === "confused" ? "The Problem" : stage.mood === "chatting" ? "The Solution" : "The Result"}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-gray-900 mb-3" style={{ fontSize: 28, fontWeight: 700 }}>
            {stage.title}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6" style={{ fontSize: 16 }}>
            {stage.desc}
          </p>
          <div className="space-y-2">
            {stage.bubbleLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                transition={{ delay: isActive ? i * 0.2 : 0, duration: 0.4 }}
                className="flex items-start gap-2"
              >
                <span className="text-orange-400 mt-1">›</span>
                <span className="text-gray-700 text-sm italic">"{line}"</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          {stage.mood === "confused" && <ConfusedPerson />}
          {stage.mood === "chatting" && <ChattingPerson />}
          {stage.mood === "happy" && <HappyPerson />}
        </div>
      </div>
    </motion.div>
  );
}

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      if (v < 0.33) setActiveStage(0);
      else if (v < 0.66) setActiveStage(1);
      else setActiveStage(2);
    });
  }, [scrollYProgress]);

  // Sticky progress indicator
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="relative" style={{ minHeight: "300vh" }}>
      {/* Sticky wrapper */}
      <div className="sticky top-0 z-10 py-4 px-4 bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            {stages.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  const el = containerRef.current;
                  if (el) {
                    const target = el.offsetTop + (i / stages.length) * el.offsetHeight + 80;
                    window.scrollTo({ top: target, behavior: "smooth" });
                  }
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-300 ${
                  activeStage === i
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-400 hover:text-orange-500"
                }`}
              >
                {i + 1}. {s.title.split(" ").slice(0, 2).join(" ")}
              </button>
            ))}
          </div>
          <div className="h-1 bg-orange-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-orange-500 rounded-full" style={{ width: progressWidth }} />
          </div>
        </div>
      </div>

      {/* Stage panels - each occupies ~1 viewport */}
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-24">
        {stages.map((stage, i) => (
          <StageCard key={stage.id} stage={stage} isActive={activeStage === i} />
        ))}
      </div>
    </section>
  );
}
