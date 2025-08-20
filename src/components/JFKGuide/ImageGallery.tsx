import Image from 'next/image';
const images = [
  {
    filename: '1.landed-at-jfk.jpeg',
    alt: 'Arriving at JFK Terminal',
    description: 'Follow the signs for Baggage Services and Ground Transportation (image is from T7 - terminal used by Aer Lingus).',
  },
  {
    filename: '2.go-left-to-airtrain.jpeg',
    alt: 'Exit to AirTrain',
    description: "After collecting your baggage, follow the clearly marked signs for 'AirTrain' in your terminal (image is from T7 - terminal used by Aer Lingus).",
  },
  {
    filename: '3.continue-to-aitrain.jpeg',
    alt: 'Continue to AirTrain',
    description: 'The AirTrain entrance is typically located near the parking garage, accessible by elevator to Level 3 (image is from T7 - terminal used by Aer Lingus).',
  },
  {
    filename: '4.left-for-airtrain-elevator.jpeg',
    alt: 'Elevator to AirTrain',
    description: 'The AirTrain entrance is typically located near the parking garage, accessible by elevator to Level 3 (image is from T7 - terminal used by Aer Lingus).',
  },
  {
    filename: '5.airrain-to-jamaca-red.jpeg',
    alt: 'Board AirTrain Red Line',
    description: "Board the AirTrain heading to Jamaica Station (red line). The train runs every 4-8 minutes and is free between terminals but costs $8.50 when exiting to Jamaica Station. The AirTrain Jamaica Line (red) connects all terminals to Jamaica Station where you'll transfer to the Long Island Rail Road (LIRR). Journey time: approximately 15 minutes.",
  },
  {
    filename: '6.exit-aitrain-use-contactless.jpeg',
    alt: 'Exit AirTrain at Jamaica',
    description: 'You can use your contactless credit card, Apple or Google pay to pay the AirTrain fee on your way out. Scan, wait for the green light and go!',
  },
  {
    filename: 'jfk-terminal-airtrain.jpg',
    alt: 'Jamaica Station platform/LIRR connection',
    description: "At Jamaica Station, follow signs for 'Long Island Rail Road' or 'LIRR'. You'll need to purchase tickets before boarding - use the ticket machines or download the MTA TrainTime app. Purchase your LIRR ticket to Penn Station. Off-peak fares are $7.75, peak fares (weekdays 4-8pm) are $10.75. Children under 5 ride free.",
    attritution: ""
  },
  {
    filename: 'lirr-train-penn.jpg',
    alt: 'LIRR train interior/Penn Station arrival',
    description: 'Board any westbound LIRR train to Penn Station. Journey time: 20 minutes. Trains run frequently with more space for luggage than subway.',
    attribution: "https://www.tutorperini.com/media/4153/tsc-525-jaimaca-station-01b.jpg"
  },
];

export default function ImageGallery() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" aria-label="Step-by-step image gallery">
      {images.map((image, index) => (
        <div key={index} className="bg-card rounded-xl shadow-lg overflow-hidden" tabIndex={0} aria-label={`Step ${index + 1}: ${image.alt}`}> 
          <Image
            src={`/images/${image.filename}`}
            alt={image.alt}
            className="w-full h-40 md:h-60 object-cover"
            style={{ aspectRatio: '3/4' }}
            width={400}
            height={300}
          />
          <div className="p-4">
            <h3 className="font-semibold mb-2">Step {index + 1}</h3>
            <p className="text-sm text-muted-foreground">{image.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
