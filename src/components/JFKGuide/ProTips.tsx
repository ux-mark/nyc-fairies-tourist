export default function ProTips() {
  return (
    <section aria-labelledby="pro-tips-title">
      <h2 id="pro-tips-title" className="text-2xl font-bold mb-4">Pro Tips & Important Notes</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Money-Saving Tips</h3>
        <ul className="list-disc ml-6 mb-2 text-muted-foreground">
          <li>Download MTA TrainTime app before departure</li>
          <li>Avoid on-train LIRR ticket purchases (expensive surcharge)</li>
          <li>Consider subway if staying near other train lines</li>
          <li>Taxi flat rate doesn&apos;t include tolls or tips</li>
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Timing Considerations</h3>
        <ul className="list-disc ml-6 mb-2 text-muted-foreground">
          <li>Peak Hours: Weekdays 4-8pm (higher fares, more crowded)</li>
          <li>Off-Peak: All other times (better value, more comfortable)</li>
          <li>Late Night: All options run 24/7 but less frequent</li>
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Useful Links</h3>
        <ul className="list-disc ml-6 mb-2">
          <li><a href="https://www.mta.info/traintime" target="_blank" rel="noopener" className="underline">MTA TrainTime App</a></li>
          <li><a href="https://www.mta.info/schedules" target="_blank" rel="noopener" className="underline">LIRR Schedules</a></li>
          <li><a href="https://www.mta.info/trip-planner" target="_blank" rel="noopener" className="underline">MTA Trip Planner</a></li>
          <li><a href="https://www.nyc.gov/site/tlc/passengers/taxi-fare.page" target="_blank" rel="noopener" className="underline">NYC Taxi Information</a></li>
          <li><a href="https://www.jfkairport.com/to-from-airport" target="_blank" rel="noopener" className="underline">JFK Airport Official Site</a></li>
        </ul>
      </div>
    </section>
  );
}
