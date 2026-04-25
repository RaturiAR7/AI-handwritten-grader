"use client";

import { useState } from "react";
import Link from "next/link";

export default function GraderPage() {
  const [examId, setExamId] = useState(`EXAM-${Math.floor(Math.random() * 10000)}`);

  const [evalModel, setEvalModel] = useState("gemini-2.5-flash");
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.1-flash-lite-preview",
    "gemma-3-27b-it",
  ];

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<{ type: "success" | "error" | ""; msg: string }>({ type: "", msg: "" });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<any>(null);
  const [gradeError, setGradeError] = useState("");

  const handlePdfUpload = async () => {
    if (!pdfFile || !examId) return;
    setIsUploadingPdf(true);
    setPdfStatus({ type: "", msg: "" });
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("examId", examId);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload");
      setPdfStatus({ type: "success", msg: "Answer key stored successfully." });
    } catch (err: any) {
      setPdfStatus({ type: "error", msg: err.message || "An error occurred" });
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleGradeExam = async () => {
    if (imageFiles.length === 0 || !examId) return;
    setIsGrading(true);
    setGradeError("");
    setGradeResult(null);
    try {
      const formData = new FormData();
      imageFiles.forEach((f) => formData.append("images", f));
      formData.append("examId", examId);
      formData.append("model", evalModel);
      const res = await fetch("/api/grade", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grade exam");
      setGradeResult(data);
    } catch (err: any) {
      setGradeError(err.message || "An error occurred while grading");
    } finally {
      setIsGrading(false);
    }
  };

  const pct = gradeResult ? Number(gradeResult.percentage) : 0;

  return (
    <div className="bg-[#111] min-h-screen text-white font-sans">

      {/* ── Navbar ── */}
      <header className="border-b border-[#222] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#111] z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-white flex items-center justify-center">
            <span className="text-black font-black text-xs leading-none">A+</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">AutoGrade</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[#555]">Session</span>
          <input
            type="text"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="w-28 text-center bg-[#161616] border border-[#2a2a2a] rounded px-2 py-1 text-[#ccc] text-xs focus:outline-none focus:border-[#444]"
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Upload panels ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* Answer Key */}
          <div className="rounded-xl border border-[#222] bg-[#161616] p-6 flex flex-col gap-4">
            <div>
              <h2 className="font-semibold text-base">Answer Key</h2>
              <p className="text-[#666] text-sm mt-1">Upload the PDF containing the correct answers.</p>
            </div>
            <label className="border border-dashed border-[#2a2a2a] rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[#444] transition-colors">
              <svg className="w-7 h-7 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-[#777] text-sm">{pdfFile ? pdfFile.name : "Click to select PDF"}</span>
              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
            </label>
            <button
              onClick={handlePdfUpload}
              disabled={!pdfFile || isUploadingPdf}
              className="w-full py-2 rounded bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] transition-colors disabled:bg-[#2a2a2a] disabled:text-[#555] disabled:cursor-not-allowed"
            >
              {isUploadingPdf ? "Processing…" : "Process Answer Key"}
            </button>
            {pdfStatus.msg && (
              <p className={`text-xs ${pdfStatus.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                {pdfStatus.msg}
              </p>
            )}
          </div>

          {/* Grade Submission */}
          <div className="rounded-xl border border-[#222] bg-[#161616] p-6 flex flex-col gap-4">
            <div>
              <h2 className="font-semibold text-base">Grade Submission</h2>
              <p className="text-[#666] text-sm mt-1">Upload a photo of the handwritten exam sheet.</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#555] text-xs">Model</label>
              <select
                value={evalModel}
                onChange={(e) => setEvalModel(e.target.value)}
                className="bg-[#1e1e1e] border border-[#2a2a2a] rounded px-3 py-2 text-[#ccc] text-sm focus:outline-none focus:border-[#444]"
              >
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <label className="border border-dashed border-[#2a2a2a] rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[#444] transition-colors">
              <svg className="w-7 h-7 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[#777] text-sm">
                {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : "Click to select image(s)"}
              </span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImageFiles(Array.from(e.target.files || []))} />
            </label>
            <button
              onClick={handleGradeExam}
              disabled={imageFiles.length === 0 || isGrading}
              className="w-full py-2 rounded bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] transition-colors disabled:bg-[#2a2a2a] disabled:text-[#555] disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGrading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Grading…
                </>
              ) : "Grade Exam"}
            </button>
            {gradeError && <p className="text-red-400 text-xs">{gradeError}</p>}
          </div>
        </div>

        {/* ── Results ── */}
        {gradeResult && (
          <div className="rounded-xl border border-[#222] bg-[#161616] overflow-hidden">

            {/* Score header */}
            <div className="border-b border-[#222] px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-base">Grading Report</h2>
                <p className="text-[#555] text-xs mt-1 font-mono">{gradeResult.examId}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[#555] text-xs">Score</p>
                  <p className="text-2xl font-black">
                    {gradeResult.totalScore}
                    <span className="text-[#444] text-lg">/{gradeResult.maxScore}</span>
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-sm font-bold ${pct >= 70 ? "border-emerald-500 text-emerald-400" : "border-orange-500 text-orange-400"}`}>
                  {gradeResult.percentage}%
                </div>
              </div>
            </div>

            {/* Question breakdown */}
            <div className="p-6 flex flex-col gap-4">
              <h3 className="text-[#555] text-xs font-bold tracking-widest uppercase">Breakdown</h3>
              {gradeResult.results.map((item: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-[#222] bg-[#111] p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#555] tracking-widest">{item.questionId}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${item.score >= 8 ? "bg-emerald-950 text-emerald-400" : item.score >= 5 ? "bg-yellow-950 text-yellow-400" : "bg-red-950 text-red-400"}`}>
                      {item.score}/10
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-[#161616] border border-[#222] rounded p-3">
                      <p className="text-[#444] text-xs uppercase tracking-wider mb-1">Student</p>
                      <p className="text-[#aaa]">{item.studentAnswer || <span className="italic text-[#555]">Blank</span>}</p>
                    </div>
                    <div className="bg-[#161616] border border-[#222] rounded p-3">
                      <p className="text-[#444] text-xs uppercase tracking-wider mb-1">Expected</p>
                      <p className="text-[#aaa]">{item.correctAnswer}</p>
                    </div>
                  </div>
                  <div className="border-l-2 border-[#333] pl-3">
                    <p className="text-[#666] text-sm">{item.feedback}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
