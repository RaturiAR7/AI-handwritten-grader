import { Footer, Hero, Navbar, Work } from "./components";

export const metadata = {
  title: "AutoGrade - AI Exam Grader",
  description: "Grade handwritten exams instantly using AI",
};

export default function Landing() {
  return (
    <main className='bg-[#111] min-h-screen text-white font-sans'>
      <Navbar />
      <Hero />
      <Work />
      <Footer />
    </main>
  );
}
