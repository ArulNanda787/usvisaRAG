"use client"
import { trackEvent } from "@/lib/analytics";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlobeCdn } from "./components/globe";
import { ScrollStory } from "./components/ScrollStory";
import { Plane, Shield, Clock, Star, ChevronDown, MessageCircle, Plus, Minus } from "lucide-react";
import { useState } from "react"; 

const features = [
  { icon: <Plane size={22} />, title: "Every Visa Type", desc: "F-1, B-1/B-2, H-1B, O-1, J-1 and more — Thomas knows them all." },
  { icon: <Shield size={22} />, title: "Document Checklist", desc: "Know exactly what to prepare before your appointment." },
  { icon: <Clock size={22} />, title: "Timeline Guidance", desc: "Get realistic timelines based on your consulate and visa type." },
  { icon: <Star size={22} />, title: "Interview Prep", desc: "Practice with common interview questions and expert tips." },
];

const faqs = [
  { q: "Is Thomas free to use?", a: "Yes, completely free. No sign-up required. Just start chatting." },
  { q: "Is this legal advice?", a: "No. Thomas provides general guidance based on official information available on https://www.state.gov and https://www.ustraveldocs.com/, but is not a lawyer or immigration consultant." },
  { q: "Which visas does Thomas cover?", a: "F-1, B-1/B-2, H-1B, O-1, J-1, M-1 and more! All major US visa categories for Indian applicants." },
  { q: "How accurate is the information?", a: "Thomas' knowledge base is drawn from official US government sources. Always verify critical details at travel.state.gov." },
  { q: "Can Thomas help me prepare for my interview?", a: "Yes! Thomas can walk you through common interview questions, what to wear, what to bring, and how to answer confidently." },
  { q: "Does Thomas store my personal data?", a: "No IP addresses are currently stored. Your conversation may be saved for improving Thomas and analysis purposes." },
];

// Change FAQItem to accept openIndex/setOpenIndex instead of managing its own state:
function FAQItem({ item, index, openIndex, setOpenIndex }: { item: { q: string; a: string }; index: number; openIndex: number | null; setOpenIndex: (i: number | null) => void }) {
  const open = openIndex === index;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.45 }}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${open ? "border-orange-300 bg-orange-50 shadow-md shadow-orange-100" : "border-orange-100 bg-white hover:border-orange-200"}`}
    >
      <button onClick={() => setOpenIndex(open ? null : index)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group">
        <span className={`transition-colors duration-200 ${open ? "text-orange-600" : "text-gray-900 group-hover:text-orange-500"}`} style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4 }}>
          {item.q}
        </span>
        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${open ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-500"}`}>
          {open ? <Minus size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="answer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
            <p className="px-6 pb-6 text-gray-600 leading-relaxed" style={{ fontSize: 15 }}>{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
export default function Home() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);
  const heroY = useTransform(heroScroll, [0, 0.6], [0, -60]);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  useEffect(() => {
  window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/thomas.png" alt="Thomas" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-bold text-gray-900" style={{ fontSize: 20 }}>Thomas</span>
            <span className="hidden md:inline-flex text-orange-500 text-xs font-semibold ml-1 px-2 py-0.5 bg-orange-50 rounded-full border border-orange-200">
              US Visa HelpBot
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["How It Works", "Features", "FAQ"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-gray-600 hover:text-orange-500 transition-colors text-sm font-medium">
                {item}
              </a>
            ))}
          </div>
          <button
            onClick={() => { trackEvent("button_click", { button_id: "nav_ask_thomas", page: "home" }); router.push("/select"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-full text-xs font-semibold hover:bg-orange-600 transition-colors shadow-md md:px-4 md:py-2 md:text-sm md:gap-2"
          >
            <MessageCircle size={13} className="md:hidden" />
            <MessageCircle size={15} className="hidden md:block" />
            Ask Thomas
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-orange-100/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-orange-200/30 blur-2xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div style={{ opacity: heroOpacity, y: heroY }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-6 border border-orange-200">
                  <img src="/thomas.png" alt="Thomas" className="w-4 h-4 rounded-full object-cover" /> AI-Powered Visa Guidance
                </div>
                <h1 className="text-gray-900 mb-2 leading-tight" style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800 }}>
                  Thomas
                </h1>
                <p className="text-orange-500 mb-4" style={{ fontSize: "clamp(18px, 2.5vw, 28px)", fontWeight: 700 }}>
                  Your US Visa HelpBot
                </p>
                <p className="text-gray-600 mb-6" style={{ fontSize: 18, lineHeight: 1.6 }}>
                  From confusion to approval — simplify your US visa journey.
                </p>
                <div className="flex items-center gap-3 mb-10">
                  {["Ask", "Apply", "Go"].map((word, i) => (
                    <div key={word} className="flex items-center gap-3">
                      <span className="font-bold text-orange-500" style={{ fontSize: 20 }}>{word}</span>
                      {i < 2 && <span className="text-orange-300">·</span>}
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { trackEvent("button_click", { button_id: "hero_start_journey", page: "home" }); router.push("/select"); }}
                  className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-xl hover:bg-orange-600 transition-colors flex items-center gap-3"
                  style={{ fontSize: 18 }}
                >
                  <MessageCircle size={22} />
                  Start Your Visa Journey
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <GlobeCdn />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                  <p className="text-orange-500 text-sm font-semibold">India 🇮🇳 → USA 🇺🇸</p>
                  <p className="text-gray-400 text-xs">Your journey starts here</p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 text-center"
          >
            <p className="text-gray-900 mb-3" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800 }}>
              The American Dream Starts Here.
            </p>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: 17 }}>
              Whether you're a student, tourist, or professional — get step-by-step guidance for your US visa, powered by AI.
            </p>
          </motion.div>

          <motion.div className="mt-16 flex justify-center" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <div className="flex flex-col items-center gap-1 text-orange-400">
              <span className="text-xs font-medium tracking-wide">Scroll to see your journey</span>
              <ChevronDown size={20} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div id="how-it-works">
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-2 text-center">
          <p className="text-orange-500 text-sm font-bold tracking-widest uppercase mb-3">Your Journey</p>
          <h2 className="text-gray-900" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800 }}>
            From Confused to Approved
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Scroll through the story of how Thomas transforms a confusing process into a clear, confident path to your visa.
          </p>
        </div>
        <ScrollStory />
      </div>

      {/* FEATURES */}
      <section id="features" className="pt-10 pb-24 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-bold tracking-widest uppercase mb-3">What Thomas Does</p>
            <h2 className="text-gray-900" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800 }}>
              Everything You Need, In One Chat
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white rounded-2xl border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-gray-900 mb-2" style={{ fontSize: 17, fontWeight: 700 }}>{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-gradient-to-b from-orange-50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-orange-100/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p className="text-orange-500 text-sm font-bold tracking-widest uppercase mb-3">Got Questions?</p>
              <h2 className="text-gray-900 mb-4" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800 }}>Frequently Asked Questions</h2>
              <p className="text-gray-500 leading-relaxed" style={{ fontSize: 16 }}>
                {"Everything you need to know about Thomas and the US visa process. Can't find the answer? Just ask Thomas directly."}
              </p>
            </motion.div>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((item, i) => <FAQItem key={i} item={item} index={i} openIndex={faqOpenIndex} setOpenIndex={setFaqOpenIndex} />)}
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.5 }} className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-4 px-8 py-6 bg-white rounded-2xl border border-orange-200 shadow-sm shadow-orange-100">
              <p className="text-gray-700 font-semibold" style={{ fontSize: 16 }}>Still have a question?</p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { trackEvent("button_click", { button_id: "faq_ask_thomas", page: "home" }); router.push("/select"); }}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-md shadow-orange-200"
              >
                <MessageCircle size={16} />
                Ask Thomas Directly
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-orange-400/40 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-amber-400/30 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-6xl mb-6">🇺🇸</p>
            <h2 className="text-white mb-4" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800 }}>
              Your American Dream is One Chat Away
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { trackEvent("button_click", { button_id: "cta_chat_free", page: "home" }); router.push("/select"); }}
              className="px-10 py-4 bg-white text-orange-500 rounded-2xl font-bold shadow-2xl transition-all flex items-center gap-3 mx-auto"
              style={{ fontSize: 18 }}
            >
              <MessageCircle size={22} />
              Chat with Thomas — It's Free
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/thomas.png" alt="Thomas" className="w-8 h-8 rounded-full object-cover" />
            <span className="text-white font-bold">Thomas</span>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">© 2026 Thomas. For informational purposes only. Not legal advice.</p>
            <p className="text-gray-600 text-sm mt-2">Made with 🤍 by <span className="text-orange-400 font-semibold">Arul Nanda</span> for the World</p>
          </div>
          <div className="flex gap-6 text-gray-400 text-sm">
            <a   href="/terms"
              onClick={() => trackEvent("footer_link_click", { link: "terms", page: "home" })}
              className="hover:text-orange-400 transition-colors"
            >Terms</a>
            <a href="https://www.linkedin.com/in/arul-nanda"
              onClick={() => trackEvent("footer_link_click", { link: "contact", page: "home" })}
              className="hover:text-orange-400 transition-colors"
            >Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}