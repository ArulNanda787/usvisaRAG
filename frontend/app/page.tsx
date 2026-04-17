"use client"

import { useRouter } from "next/navigation"
import { GlobeCdn } from "./components/globe"

export default function Home() {
  const router = useRouter()
  const ORANGE_GRADIENT = "linear-gradient(270deg, #d97706, #f36e26, #d97706)"
  const YELLOW_GRADIENT = "linear-gradient(270deg, #eac404, #f4e325, #f5ec44)"

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full min-h-screen p-8 overflow-hidden">

      {/* Left Text */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-start mb-6 md:mb-0">
        <div className="flex flex-col gap-4">

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span
              className="font-sans bg-clip-text text-transparent animate-[borderFlow_6s_ease_infinite]"
              style={{ backgroundImage: ORANGE_GRADIENT, backgroundSize: "200% 200%" }}
            >
              Thomas
            </span>
            <br />
            <span className="text-white font-sans">Your US Visa HelpBot</span>
          </h1>

          <p className="text-teal-300 text-lg md:text-xl font-sans max-w-xl">
            From confusion to approval -
            <span className="text-white font-medium"> simplify your US visa journey.</span>
          </p>

          <p
            className="text-sm md:text-base font-semibold uppercase bg-clip-text text-transparent animate-[borderFlow_6s_ease_infinite]"
            style={{ backgroundImage: ORANGE_GRADIENT, backgroundSize: "200% 200%" }}
          >
            Ask &nbsp;·&nbsp; Apply &nbsp;·&nbsp; Go
          </p>

          <div
            className="flex flex-col gap-2 mt-2 pl-4"
            style={{
              borderLeft: "2px solid transparent",
              borderImage: `${YELLOW_GRADIENT} 1`,
            }}
          >
            <p
              className="text-xl md:text-2xl font-sans font-bold bg-clip-text text-transparent animate-[borderFlow_6s_ease_infinite]"
              style={{ backgroundImage: YELLOW_GRADIENT, backgroundSize: "200% 200%" }}
            >
              The American Dream Starts Here.
            </p>

            <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed max-w-md">
              Whether you're a <span className="text-gray-200 font-medium">student</span>,{" "}
              <span className="text-gray-200 font-medium">tourist</span>, or{" "}
              <span className="text-gray-200 font-medium">professional</span> — get step-by-step guidance
              for your US visa, powered by{" "}
              <span
                className="font-sans bg-clip-text text-transparent animate-[borderFlow_6s_ease_infinite]"
                style={{ backgroundImage: YELLOW_GRADIENT, backgroundSize: "200% 200%" }}
              >
                AI
              </span>
              .
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