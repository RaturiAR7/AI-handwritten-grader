import Link from "next/link";
import { steps } from "@/constants";


export default function Landing() {
  return (
    <div className="bg-[#111] min-h-screen text-white font-sans">

      {/* ── Navbar ── */}
      <header className="border-b border-[#222] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#111] z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-white flex items-center justify-center">
            <span className="text-black font-black text-xs leading-none">A+</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">AutoGrade</span>
        </div>
        <Link
          href="/grader"
          className="text-sm font-medium px-4 py-1.5 rounded border border-[#333] text-[#ccc] hover:bg-[#222] hover:text-white transition-colors"
        >
          Open App
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-black leading-tight tracking-tight">
          Grade handwritten<br />exams in seconds
        </h1>
        <p className="mt-5 text-[#888] text-lg max-w-xl mx-auto leading-relaxed">
          Upload an answer key PDF and a photo of the student's exam. AutoGrade extracts answers, scores them, and returns a full grading report.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/grader"
            className="px-6 py-2.5 rounded bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] transition-colors"
          >
            Try it now
          </Link>
          <a
            href="#how-it-works"
            className="px-6 py-2.5 rounded border border-[#333] text-[#aaa] text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            How it works
          </a>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-[#222] bg-[#161616] p-6 hover:border-[#333] transition-colors"
            >
              <span className="text-[#444] text-xs font-bold tracking-widest">{s.n}</span>
              <h3 className="mt-3 text-white font-semibold text-base">{s.title}</h3>
              <p className="mt-2 text-[#777] text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#222] px-6 py-5 text-center text-[#555] text-xs">
        AutoGrade — automated handwritten exam grading
      </footer>

    </div>
  );
}
