import JFKGuide from '../../components/JFKGuide/JFKGuide';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JFK to Manhattan Transportation Guide 2025 | Visit the  Fairies in NYC! 🧚‍♀️🗽🧚 ',
  description: 'Complete step-by-step guide from JFK Airport to Manhattan. AirTrain, LIRR, subway, and taxi options with current prices and schedules.',
};

export default function JFKToManhattanPage() {
  return <JFKGuide />;
}
