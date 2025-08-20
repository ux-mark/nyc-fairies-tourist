export default function TransportOptions() {
	return (
		<section aria-labelledby="transport-options-title">
			<h2 id="transport-options-title" className="text-2xl font-bold mb-4">Transportation Options Breakdown</h2>
			<div className="mb-8">
				<h3 className="text-xl font-semibold mb-2">Option 1: AirTrain + LIRR (Recommended)</h3>
			<ul className="list-disc ml-6 mb-2 text-muted-foreground px-2 md:px-4">
					<li>Total Cost: $16.25 off-peak / $19.25 peak (including $8.50 AirTrain)</li>
					<li>Journey Time: 35-45 minutes total</li>
					<li>Frequency: Every 3-20 minutes depending on time</li>
					<li>Benefits: Fast, reliable, luggage space, direct to Penn Station where we will meet you.</li>
				</ul>
				<h4 className="font-semibold mb-1">Ticket Purchase Options:</h4>
			<ol className="list-decimal ml-6 mb-2 px-2 md:px-4">
					<li>MTA TrainTime App (<a href="https://www.mta.info/traintime" target="_blank" rel="noopener" className="underline">Download</a>)</li>
					<li>Ticket Machines at Jamaica Station</li>
					<li>On-Train Purchase (Not Recommended, surcharge applies)</li>
				</ol>
			</div>
			<div className="mb-8">
				<h3 className="text-xl font-semibold mb-2">Option 2: Taxi (Yellow Cab)</h3>
			<ul className="list-disc ml-6 mb-2 text-muted-foreground px-2 md:px-4">
					<li>Flat Rate: $70 (Manhattan only)</li>
					<li>Additional Costs: Tolls, surcharges, tip</li>
					<li>Total Estimated Cost: $90-105</li>
					<li>Journey Time: 45-75 minutes (traffic dependent)</li>
				</ul>
				<a href="https://www.nyc.gov/site/tlc/passengers/taxi-fare.page" target="_blank" rel="noopener" className="underline">NYC Taxi Information</a>
			</div>
		</section>
	);
}
