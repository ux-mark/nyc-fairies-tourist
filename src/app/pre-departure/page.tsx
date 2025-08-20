import ESTAGuide from '../../components/PreDeparture/ESTAGuide';
import MobileOptions from '../../components/PreDeparture/MobileOptions';
import MobileComparison from '../../components/PreDeparture/MobileComparison';
import DocumentationChecklist from '../../components/PreDeparture/DocumentationChecklist';
import Head from 'next/head';

export default function PreDeparturePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Head>
        <title>Pre-Departure Guide: ESTA & Mobile Plans for NYC Travel 2025</title>
        <meta name="description" content="Essential pre-departure checklist for NYC visitors: ESTA application, mobile phone plans, and travel preparation tips." />
        <meta name="keywords" content="ESTA, Visa Waiver Program, USA eSIM, NYC travel preparation" />
      </Head>
      <section className="py-8 px-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Pre-Departure Essentials for Your NYC Trip with the Fairies</h1>
        <div className="mb-8">
          <ESTAGuide />
        </div>
        <div className="mb-8">
          <MobileOptions />
        </div>
        <div className="mb-8">
          <MobileComparison />
        </div>
        <div className="mb-8">
          <DocumentationChecklist />
        </div>
        <div className="mt-8 text-sm text-gray-500">
          <p>Let us know if you need the Fairies&apos; address.</p>
          <p className="mt-2">Always check official .gov websites for latest requirements. Visa/immigration laws can change without notice. Mobile plan prices and availability subject to change. This guide is for informational purposes only.</p>
        </div>
      </section>
    </main>
  );
}
