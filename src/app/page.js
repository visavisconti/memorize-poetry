import Image from "next/image";
import PoemOfTheDay from '../components/PoemOfTheDay';

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
      	<h1>Gedicht des Tages</h1>
      	<PoemOfTheDay />
      	
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
     
      </footer>
    </div>
  );
}
