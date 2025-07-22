import Hero from "@/components/Hero";
import FeatureCard from "@/components/FeatureCard";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Why Choose Nidaan Pro?</h2>
          <p className="text-lg text-gray-600">A smarter way to manage your health.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="AI Pre-Consultation"
            description="Our smart AI asks you the right questions beforehand, saving you and your doctor valuable time during the actual consultation."
          />
          <FeatureCard
            title="Instant Chat & Video"
            description="Connect with your doctor through secure, real-time chat and high-quality video calls for a seamless consultation experience."
          />
          <FeatureCard
            title="Emergency Connect"
            description="Need urgent advice? Our emergency feature instantly connects you to the next available doctor for immediate help."
          />
        </div>
      </section>
    </div>
  );
}