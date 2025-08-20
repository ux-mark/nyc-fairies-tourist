export default function SubwayMap() {
  return (
    <section aria-labelledby="subway-map-title">
      <h2 id="subway-map-title" className="text-2xl font-bold mb-4">Subway Navigation Help</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Getting Around Manhattan</h3>
        <p className="mb-2">Primary Line: <strong>1 Train (West Side)</strong></p>
        <ul className="list-disc ml-6 mb-2 text-muted-foreground">
          <li>Runs north-south on Manhattan&apos;s west side</li>
          <li>Key Stops: 34th St-Penn Station, 42nd St-Times Square, 59th St-Columbus Circle, 103rd St or 110th St</li>
        </ul>
        <p className="mb-2">Alternative: <strong>2/3 Trains</strong> (express)</p>
        <ul className="list-disc ml-6 mb-2 text-muted-foreground">
          <li>Transfer at 96th St to 1 train, or walk from 96th St</li>
        </ul>
        <p className="mb-2">Payment: Tap contactless card or mobile wallet. $2.90 per ride.</p>
        <a href="https://www.mta.info/trip-planner" target="_blank" rel="noopener" className="underline">MTA Trip Planner</a>
      </div>
    </section>
  );
}
