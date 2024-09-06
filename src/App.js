import React, { useState, useEffect } from 'react';
import { useSpring, animated, useInView, useTrail } from '@react-spring/web';
import { FaTwitter, FaDiscord, FaMapMarkedAlt, FaGamepad, FaUsers, FaExchangeAlt } from 'react-icons/fa'; 
import memecoin from './images/memecoin.png';

function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const sections = ['hero', 'features', 'powerup', 'roadmap-community'];

  useEffect(() => {
    const handleScroll = () => {
      const newSection = Math.round(window.scrollY / window.innerHeight);
      setCurrentSection(newSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (section) => {
    const element = document.getElementById(section);
    element.scrollIntoView({ behavior: 'smooth' });
  };

  // Hero Section Animation
  const [heroRef, heroInView] = useInView({
    threshold: 0.5,
  });

  const heroAnimation = useSpring({
    opacity: heroInView ? 1 : 0,
    transform: heroInView ? 'translateY(0px)' : 'translateY(-50px)',
    config: { mass: 1, tension: 280, friction: 60 }
  });

  const titleAnimation = useSpring({
    from: { rotateX: -90 },
    to: { rotateX: heroInView ? 0 : -90 },
    config: { mass: 5, tension: 2000, friction: 200 }
  });

  // Features Section Animation
  const [featuresRef, featuresInView] = useInView({
    threshold: 0.5,
  });

  const featureCards = [
    { icon: FaMapMarkedAlt, title: "Own Your Land", description: "Purchase and customize your own piece of Frogtopia." },
    { icon: FaGamepad, title: "Embark on Quests", description: "Complete exciting quests to earn $CROAK and rare NFTs!" },
    { icon: FaUsers, title: "Thriving Community", description: "Connect and collaborate with other players in a vibrant community." },
    { icon: FaExchangeAlt, title: "Trade & Earn", description: "Trade your valuable NFTs and earn $CROAK in a player-driven economy." },
  ];

  const trail = useTrail(featureCards.length, {
    opacity: featuresInView ? 1 : 0,
    transform: featuresInView ? 'translateY(0px)' : 'translateY(50px)',
    config: { mass: 1, tension: 280, friction: 60 },
  });

  // Power Up Section Animation
  const [powerUpRef, powerUpInView] = useInView({
    threshold: 0.5,
  });

  const powerUpAnimation = useSpring({
    opacity: powerUpInView ? 1 : 0,
    transform: powerUpInView ? 'scale(1)' : 'scale(0.8)',
    config: { mass: 1, tension: 280, friction: 60 }
  });

  // Roadmap & Community Section Animation
  const [roadmapCommunityRef, roadmapCommunityInView] = useInView({
    threshold: 0.5,
  });

  const roadmapAnimation = useSpring({
    opacity: roadmapCommunityInView ? 1 : 0,
    transform: roadmapCommunityInView ? 'translateX(0px)' : 'translateX(-50px)',
    config: { mass: 1, tension: 280, friction: 60 }
  });

  const communityAnimation = useSpring({
    opacity: roadmapCommunityInView ? 1 : 0,
    transform: roadmapCommunityInView ? 'translateX(0px)' : 'translateX(50px)',
    config: { mass: 1, tension: 280, friction: 60 }
  });

  return (
    <div className="bg-gradient-to-b from-green-400 to-green-600 min-h-screen text-white">
      {/* Navigation Dots */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
        {sections.map((section, index) => (
          <div
            key={section}
            className={`w-3 h-3 my-2 rounded-full cursor-pointer transition-all duration-300 ${
              currentSection === index ? 'bg-yellow-300 scale-125' : 'bg-white opacity-50 hover:opacity-100'
            }`}
            onClick={() => scrollTo(section)}
          />
        ))}
      </div>

      {/* Hero Section */}
      <animated.section 
        id="hero" 
        style={heroAnimation}
        className="h-screen flex flex-col items-center justify-center py-24 md:py-32 px-4 md:px-8 text-center"
        ref={heroRef} 
      >
        <animated.h1 
          style={titleAnimation}
          className="text-5xl md:text-7xl font-extrabold mb-6 text-shadow-lg"
        >
          <span className="text-yellow-300">Frog</span>topia
        </animated.h1>

        <animated.p 
          className="text-xl md:text-2xl opacity-80 mb-10 max-w-2xl text-shadow"
        >
          A Play-to-Earn Metaverse on Linea. Leap into a vibrant 2D world, own land, embark on quests, play mini-games, and earn real rewards!
        </animated.p>

        <animated.button 
          className="bg-yellow-300 hover:bg-yellow-400 text-green-700 font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105"
        >
          Explore Now
        </animated.button>
      </animated.section>

      {/* Features Section */}
      <section 
        id="features" 
        className="min-h-screen flex items-center bg-gradient-to-b from-green-600 to-green-700 py-16 md:py-32"
        ref={featuresRef} 
      >
        <div className="container mx-auto px-4 md:px-8">
          <animated.h2
            style={trail[0]}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-yellow-300 text-shadow-lg"
          >
            Key Features
          </animated.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trail.map((style, index) => (
              <animated.div
                key={index}
                style={style}
                className="bg-green-800 bg-opacity-50 p-8 rounded-lg shadow-xl flex flex-col items-center transform hover:scale-105 transition duration-300"
              >
                {React.createElement(featureCards[index].icon, { className: "text-5xl text-yellow-300 mb-6" })}
                <h3 className="text-2xl font-semibold mb-4 text-white">{featureCards[index].title}</h3>
                <p className="text-gray-200 text-center">{featureCards[index].description}</p>
              </animated.div>
            ))}
          </div> 
        </div>
      </section>

      {/* Efrogs & $CROAK Section */}
      <section 
        id="powerup" 
        className="min-h-screen flex items-center bg-gradient-to-b from-green-700 to-green-800 py-16 md:py-32"
        ref={powerUpRef} 
      >
        <div className="container mx-auto px-4 md:px-8">
          <animated.h2
            style={powerUpAnimation}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-yellow-300 text-shadow-lg"
          >
            Power Up Your Journey
          </animated.h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <animated.div
              style={powerUpAnimation}
              className="bg-green-900 bg-opacity-50 p-8 rounded-lg shadow-xl flex-1 flex flex-col items-center text-center md:mr-4 transform hover:scale-105 transition duration-300"
            >
              <img src="https://i.nfte.ai/ia/m901/49940/5388364586728141394_970393227.avif" alt="Efrogs NFT" className="w-40 mb-6 rounded-lg shadow-lg" />
              <h3 className="text-2xl font-semibold mb-4 text-yellow-300">Efrogs NFT</h3>
              <ul className="text-gray-200 list-disc list-inside mb-6"> 
                <li>Unlock special abilities</li>
                <li>Access exclusive areas</li>
                <li>Earn more $CROAK</li>
                <li>Showcase your unique frog</li>
              </ul>
              <button className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold py-2 px-6 rounded-full text-lg transition duration-300">
                Learn More
              </button>
            </animated.div>
            <animated.div
              style={powerUpAnimation}
              className="bg-green-900 bg-opacity-50 p-8 rounded-lg shadow-xl flex-1 flex flex-col items-center text-center md:ml-4 transform hover:scale-105 transition duration-300"
            >
              <img src={memecoin} alt="$CROAK Token" className="w-40 mb-6 rounded-lg shadow-lg" />
              <h3 className="text-2xl font-semibold mb-4 text-yellow-300">$CROAK Token</h3>
              <ul className="text-gray-200 list-disc list-inside mb-6">
                <li>Buy and sell land</li>
                <li>Participate in games</li>
                <li>Trade with other players</li>
                <li>Fuel the Frogtopia economy</li>
              </ul>
              <button className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold py-2 px-6 rounded-full text-lg transition duration-300">
                Get $CROAK
              </button>
            </animated.div>
          </div>
        </div>
      </section>

      {/* Roadmap & Community Section */}
      <section 
        id="roadmap-community" 
        className="min-h-screen flex items-center bg-gradient-to-b from-green-800 to-green-900 py-16 md:py-32"
        ref={roadmapCommunityRef} 
      >
        <div className="container mx-auto px-4 md:px-8">
          <animated.h2
            style={roadmapAnimation}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-yellow-300 text-shadow-lg"
          >
            Roadmap & Community
          </animated.h2> 

          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            {/* Roadmap */}
            <animated.div
              style={roadmapAnimation}
              className="md:w-1/2 bg-green-800 bg-opacity-50 p-8 rounded-lg shadow-xl"
            >
              <h3 className="text-2xl font-semibold mb-6 text-yellow-300">The Future is Bright</h3>
              <ul className="text-gray-200 space-y-4">
                <li className="flex items-center">
                  <FaGamepad className="mr-3 text-yellow-300" />
                  More exciting mini-games and challenging quests
                </li>
                <li className="flex items-center">
                  <FaUsers className="mr-3 text-yellow-300" />
                  Enhanced social features like voice chat and emotes
                </li>
                <li className="flex items-center">
                  <FaMapMarkedAlt className="mr-3 text-yellow-300" />
                  Expansion of the Frogtopia world with new areas to explore
                </li>
                <li className="flex items-center">
                  <FaExchangeAlt className="mr-3 text-yellow-300" />
                  Community-driven events and competitions
                </li>
              </ul>
            </animated.div>

            {/* Community */}
            <animated.div
              style={communityAnimation}
              className="md:w-1/2 bg-green-800 bg-opacity-50 p-8 rounded-lg shadow-xl flex flex-col items-center"
            >
              <h3 className="text-2xl font-semibold mb-6 text-yellow-300">Join the Community</h3>
              <div className="flex justify-center gap-8 mb-8">
                <a href="#" className="text-white hover:text-yellow-300 transition duration-300">
                  <FaTwitter className="text-5xl" />
                </a>
                <a href="#" className="text-white hover:text-yellow-300 transition duration-300">
                  <FaDiscord className="text-5xl" />
                </a>
              </div>
              <p className="text-gray-200 text-center text-lg">Connect with other Frogtopians, share your ideas, and stay up-to-date on the latest news!</p>
            </animated.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 py-6 text-center text-gray-300"> 
        <p>&copy; 2024 Frogtopia. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;