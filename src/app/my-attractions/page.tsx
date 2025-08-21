import { Metadata } from 'next';
import UserSubmissions from '../../components/UserSubmissions';

export const metadata: Metadata = {
  title: 'My Attractions | Visit the Fairies in NYC! 🧚‍♀️🗽🧚',
  description: 'Manage your submitted attractions and view their approval status.',
};

export default function MyAttractionsPage() {
  return (
    <div className="font-sans min-h-screen p-4 pb-20 sm:p-8 lg:p-20">
      <div className="max-w-6xl mx-auto">
        <UserSubmissions />
      </div>
    </div>
  );
}
