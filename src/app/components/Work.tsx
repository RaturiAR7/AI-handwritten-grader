import { steps } from "@/constants";

const Work = () => {
  return (
    <section id='how-it-works' className='max-w-5xl mx-auto px-6 pb-24'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {steps.map((s) => (
          <div
            key={s.n}
            className='rounded-xl border border-[#222] bg-[#161616] p-6 hover:border-[#333] transition-colors'
          >
            <span className='text-[#444] text-xs font-bold tracking-widest'>
              {s.n}
            </span>
            <h3 className='mt-3 text-white font-semibold text-base'>
              {s.title}
            </h3>
            <p className='mt-2 text-[#777] text-sm leading-relaxed'>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Work;
