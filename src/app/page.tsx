
import AttractionsList from "../components/AttractionsList";
import TripSchedule from "../components/TripSchedule";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-4 pb-20 sm:p-8 lg:p-20">
      <h1 className="text-2xl font-bold mb-8 text-center lg:text-left">NYC Attractions</h1>
      <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div>
          <AttractionsList />
        </div>
        <aside className="lg:sticky lg:top-6 self-start">
          <TripSchedule />
        </aside>
      </div>
    </div>
  );
}
