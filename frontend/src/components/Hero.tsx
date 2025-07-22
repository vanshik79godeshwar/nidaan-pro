import Link from 'next/link';

export default function Hero() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">
        Your Health, Simplified.
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Connect with expert doctors instantly and get the care you need, right from home.
      </p>
      <div className="flex justify-center">
        <Link href="/doctors" className="px-8 py-3 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600">
          Find a Doctor
        </Link>
      </div>
    </div>
  );
}