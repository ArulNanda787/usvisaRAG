"use client"

import { useRouter } from "next/navigation"
import { GlobeCdn } from "./components/globe"

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full min-h-screen p-8 overflow-hidden">
      
      {/* Left Text */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-start mb-6 md:mb-0">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-yellow-400">Thomas</span>
            <br />
            <span className="text-white font-sans">Your US Visa Assistant</span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed max-w-xl">
            From confusion to approval —{" "}
            <span className="text-white font-medium">simplify your US visa journey.</span>
          </p>

          <p className="text-yellow-400 text-sm md:text-base font-semibold tracking-[0.2em] uppercase">
            Ask &nbsp;·&nbsp; Apply &nbsp;·&nbsp; Go
          </p>

          <div className="flex flex-col gap-2 mt-2 border-l-2 border-yellow-400 pl-4">
            <p className="text-white text-xl md:text-2xl font-bold tracking-tight">
              The American Dream Starts Here.
            </p>
            <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed max-w-md">
              Whether you're a <span className="text-gray-200 font-medium">student</span>,{" "}
              <span className="text-gray-200 font-medium">tourist</span>, or{" "}
              <span className="text-gray-200 font-medium">professional</span> — get step-by-step guidance
              for your US visa, powered by{" "}
              <span className="text-yellow-400 font-medium">AI.</span>
            </p>
          </div>

          <button
            onClick={() => router.push("/chat")}
            className="mt-2 w-fit px-6 py-3 rounded-xl text-sm font-semibold text-white tracking-wide transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #1e3a6e, #2d5be3)" }}
          >
            Ask Thomas →
          </button>
        </div>
      </div>

      {/* Right Globe */}
      <div className="w-full md:w-1/2 flex justify-center">
        <div className="w-full max-w-lg">
          <GlobeCdn />
        </div>
      </div>

    </div>
  )
}