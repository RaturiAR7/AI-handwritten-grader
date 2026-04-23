"use client";

import { useState } from "react";

export default function Home() {
  const [examId, setExamId] = useState(`EXAM-${Math.floor(Math.random() * 10000)}`);

  // Answer Key (PDF) State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<{ type: "success" | "error" | ""; msg: string }>({ type: "", msg: "" });

  // Student Exam (Image) State
  const [imageFile, setImageFile] = useState<File | null>(null);
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

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload");

      setPdfStatus({ type: "success", msg: "Answer key processed and stored successfully." });
    } catch (err: any) {
      setPdfStatus({ type: "error", msg: err.message || "An error occurred" });
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleGradeExam = async () => {
    if (!imageFile || !examId) return;

    setIsGrading(true);
    setGradeError("");
    setGradeResult(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("examId", examId);

      const res = await fetch("/api/grade", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grade exam");

      setGradeResult(data);
    } catch (err: any) {
      setGradeError(err.message || "An error occurred while grading");
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A+</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            AutoGrade SaaS
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm font-medium">
          <span className="text-gray-500">Exam Session ID:</span>
          <input
            type="text"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 w-32 text-center"
          />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Column 1: Knowledge Base Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col h-full transform transition duration-200 hover:shadow-md">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">1. Upload Answer Key</h2>
              <p className="text-gray-500 text-sm">Upload a master PDF document containing the correct answers to prepare the grading engine.</p>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition mb-6">
                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <span className="text-sm font-medium text-gray-600">{pdfFile ? pdfFile.name : "Click to select PDF"}</span>
                <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
              </label>

              <button
                onClick={handlePdfUpload}
                disabled={!pdfFile || isUploadingPdf}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center h-12"
              >
                {isUploadingPdf ? (
                  <span className="animate-pulse">Processing Knowledge Base...</span>
                ) : (
                  "Process Answer Key"
                )}
              </button>

              {pdfStatus.msg && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${pdfStatus.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {pdfStatus.msg}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Grade Action */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col h-full transform transition duration-200 hover:shadow-md">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">2. Grade Submission</h2>
              <p className="text-gray-500 text-sm">Upload a photo of the handwritten student exam sheet. The engine will extract answers and grade them.</p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition mb-6">
                 <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span className="text-sm font-medium text-gray-600">{imageFile ? imageFile.name : "Click to select Exam Image"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </label>

              <button
                onClick={handleGradeExam}
                disabled={!imageFile || isGrading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center h-12"
              >
                {isGrading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Analyzing & Grading...</span>
                  </span>
                ) : (
                  "Evaluate Exam"
                )}
              </button>

              {gradeError && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                  {gradeError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {gradeResult && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gray-50 border-b border-gray-200 p-8 flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Grading Report</h2>
                <p className="text-gray-500 text-sm mt-1">Exam ID: <span className="font-mono bg-gray-200 px-2 py-0.5 rounded">{gradeResult.examId}</span></p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium">Final Score</p>
                  <p className="text-3xl font-bold text-gray-900">
                    <span className={Number(gradeResult.percentage) >= 70 ? 'text-green-600' : 'text-orange-600'}>
                      {gradeResult.totalScore}
                    </span>
                    <span className="text-gray-400 text-2xl">/{gradeResult.maxScore}</span>
                  </p>
                </div>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${
                  Number(gradeResult.percentage) >= 70 ? 'border-green-500 bg-green-50 text-green-700' : 'border-orange-500 bg-orange-50 text-orange-700'
                }`}>
                  <span className="text-xl font-bold">{gradeResult.percentage}%</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-lg font-semibold mb-6">Question Breakdown</h3>
              <div className="space-y-6">
                {gradeResult.results.map((item: any, idx: number) => (
                  <div key={idx} className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full">
                          {item.questionId}
                        </span>
                        <span className={`text-sm font-semibold px-2 py-1 rounded ${item.score >= 8 ? 'bg-green-100 text-green-700' : item.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {item.score} / 10 pts
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 text-sm">
                      <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg">
                        <p className="text-gray-500 font-medium mb-1 text-xs uppercase tracking-wider">Student's Answer</p>
                        <p className="text-gray-800">{item.studentAnswer || <span className="italic text-gray-400">Blank or Illegible</span>}</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                        <p className="text-blue-500 font-medium mb-1 text-xs uppercase tracking-wider">Correct Answer Reference</p>
                        <p className="text-blue-900">{item.correctAnswer}</p>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                      <p className="text-indigo-800 text-sm"><strong>Feedback:</strong> {item.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
