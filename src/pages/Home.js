import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import Navbar from '../components/Navbar';
import { FaMapMarkedAlt, FaGamepad, FaUsers, FaExchangeAlt } from 'react-icons/fa';

function Home() {
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 }
  });

  return (
    <animated.div style={fadeIn} className="flex flex-col min-h-screen bg-gradient-to-b from-green-600 to-green-800 text-white">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto mt-16 px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-yellow-300">Welcome to Frogtopia</h1>
          <p className="text-xl mb-12">Leap into a vibrant 2D world, own land, embark on quests, play mini-games, and earn real rewards!</p>
          <img src="/api/placeholder/800/400" alt="Frogtopia World" className="rounded-lg shadow-2xl mb-16 mx-auto" />
        </section>

        {/* Features Section */}
        <section className="container mx-auto mt-16 px-4">
          <h2 className="text-4xl font-bold mb-12 text-center text-yellow-300">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={FaMapMarkedAlt} title="Own Your Land" description="Purchase and customize your own piece of Frogtopia. Build, trade, and earn from your virtual real estate." />
            <FeatureCard icon={FaGamepad} title="Play to Earn" description="Complete quests, win mini-games, and participate in events to earn $CROAK tokens and rare NFTs." />
            <FeatureCard icon={FaUsers} title="Join the Community" description="Connect with other Frogtopians, trade assets, and shape the future of our metaverse together." />
            <FeatureCard icon={FaExchangeAlt} title="NFT Marketplace" description="Buy, sell, and trade unique Frogtopia assets in our decentralized marketplace." />
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto mt-24 mb-16 px-4 text-center">
          <h2 className="text-4xl font-bold mb-8 text-yellow-300">Ready to Start Your Adventure?</h2>
          <button className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105">
            Enter Frogtopia
          </button>
        </section>
      </main>
    </animated.div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-green-700 bg-opacity-50 p-6 rounded-lg shadow-xl">
      <Icon className="text-5xl text-yellow-300 mb-4" />
      <h3 className="text-2xl font-semibold mb-4 text-yellow-300">{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default Home;