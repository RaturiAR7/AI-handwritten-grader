import Link from "next/link";

const Hero = () => {
  return (
    <section className='max-w-3xl mx-auto px-6 pt-24 pb-20 text-center'>
      <h1 className='text-5xl sm:text-6xl font-black leading-tight tracking-tight'>
        Grade handwritten
        <br />
        exams in seconds
      </h1>
      <p className='mt-5 text-[#888] text-lg max-w-xl mx-auto leading-relaxed'>
        Upload an answer key PDF and a photo of the student's exam. AutoGrade
        extracts answers, scores them, and returns a full grading report.
      </p>
      <div className='mt-8 flex flex-col sm:flex-row items-center justify-center gap-3'>
        <Link
          href='/grader'
          className='px-6 py-2.5 rounded bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] transition-colors'
        >
          Try it now
        </Link>
        <a
          href='#how-it-works'
          className='px-6 py-2.5 rounded border border-[#333] text-[#aaa] text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors'
        >
          How it works
        </a>
      </div>
    </section>
  );
};

export default Hero;
