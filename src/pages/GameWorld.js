import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import Navbar from '../components/Navbar';

function GameWorld() {
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 }
  });

  return (
    <animated.div style={fadeIn} className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 text-white">
      <Navbar />
      
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-yellow-300">Frogtopia Game World</h1>
        
        {/* Add game world content here */}
        <div className="bg-green-700 bg-opacity-50 p-6 rounded-lg shadow-xl">
          <p className="text-xl mb-4">Welcome to the Frogtopia Game World! This is where you'll be able to play mini-games, complete quests, and interact with other players.</p>
          <img src="/api/placeholder/800/400" alt="Game World Preview" className="rounded-lg shadow-xl mb-4" />
          <p>Game world implementation coming soon...</p>
        </div>
      </div>
    </animated.div>
  );
}

export default GameWorld;