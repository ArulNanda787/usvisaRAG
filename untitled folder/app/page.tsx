"use client"

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { GlobeCdn } from "./components/globe";
import { ScrollStory } from "./components/ScrollStory";
import { Plane, Shield, Clock, Star, ChevronDown, MessageCircle } from "lucide-react";

const features = [
  { icon: <Plane size={22} />, title: "Every Visa Type", desc: "F-1, B-1/B-2, H-1B, O-1, J-1 and more — Thomas knows them all." },
  { icon: <Shield size={22} />, title: "Document Checklist", desc: "Know exactly what to prepare before your appointment." },
  { icon: <Clock size={22} />, title: "Timeline Guidance", desc: "Get realistic timelines based on your consulate and visa type." },
  { icon: <Star size={22} />, title: "Interview Prep", desc: "Practice with common interview questions and expert tips." },
];

const testimonials = [
  { name: "Rudra C.", role: "Graduate Student • F-1", text: "Thomas told me exactly which documents I needed. My visa interview lasted 3 minutes. Approved! 🎉", avatar: "🧑‍🎓" },
  { name: "Uddish S.", role: "Pilot • M-1", text: "I was completely lost until I found Thomas. Step by step guidance that actually makes sense.", avatar: "🧑‍✈️" },
  { name: "Arsalaan K.", role: "Software Engineer • H1-B", text: "Planned my USA trip thanks to Thomas. The DS-160 guide saved me so much confusion!", avatar: "👨‍💻" },
];

export default function Home() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);
  const heroY = useTransform(heroScroll, [0, 0.6], [0, -60]);

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
            {["How It Works", "Features", "Testimonials"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-gray-600 hover:text-orange-500 transition-colors text-sm font-medium">
                {item}
              </a>
            ))}
          </div>
          <button
            onClick={() => router.push("/select")}
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
                  onClick={() => router.push("/select")}
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
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-8 text-center">
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
      <section id="features" className="py-24 bg-gradient-to-b from-white to-orange-50">
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

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-bold tracking-widest uppercase mb-3">Success Stories</p>
            <h2 className="text-gray-900" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800 }}>
              Real People, Real Approvals
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-6 rounded-2xl bg-orange-50 border border-orange-100 relative"
              >
                <div className="text-orange-300 text-4xl leading-none mb-4">"</div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-xl">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-orange-500 text-xs">{t.role}</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={12} className="text-orange-400 fill-orange-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
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
            <p className="text-orange-100 mb-10 text-lg leading-relaxed">
              Join thousands who simplified their US visa journey with Thomas. Free, instant, and always accurate.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/select")}
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
            <span className="text-gray-400 text-sm ml-2">— Your US Visa HelpBot</span>
          </div>
          <div className="text-center">
          <p className="text-gray-500 text-sm">© 2026 Thomas. For informational purposes only. Not legal advice.</p>
          <p className="text-gray-600 text-sm mt-1">Made with ♡ by <span className="text-orange-400 font-semibold">Arul Nanda</span> for the World</p>
        </div>
          <div className="flex gap-4 text-gray-400 text-sm">
            <a href="#" className="hover:text-orange-400 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-orange-400 transition-colors">Terms</a>
            <a href="www.linkedin.com/in/arul-nanda" className="hover:text-orange-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}