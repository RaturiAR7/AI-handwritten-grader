import Link from "next/link";

const Navbar = () => {
  return (
    <header className='border-b border-[#222] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#111] z-10'>
      <div className='flex items-center gap-2.5'>
        <div className='w-7 h-7 rounded bg-white flex items-center justify-center'>
          <span className='text-black font-black text-xs leading-none'>A+</span>
        </div>
        <span className='font-semibold text-sm tracking-tight'>AutoGrade</span>
      </div>
      <Link
        href='/grader'
        className='text-sm font-medium px-4 py-1.5 rounded border border-[#333] text-[#ccc] hover:bg-[#222] hover:text-white transition-colors'
      >
        Open App
      </Link>
    </header>
  );
};

export default Navbar;
