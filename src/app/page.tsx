import { Metadata } from "next";
import { HomeContent } from "./components/Home/HomeContent";

export const metadata: Metadata = {
  title: 'Great Migration',
  description: "Cisco Components Migration Assistant - Here to Simplify Your Transition!",
}

export default function Home() {

  return (
    <div className="flex min-h-[78vh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <HomeContent />
      <div className="w-full items-center justify-center flex p-4 bg-white fixed bottom-0 left-0">
        <p className="text-black text-xs font-light">
          Everybody makes mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
