import { Globe2, Sparkles, Database, Code, MapPin, Zap, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-linear-to-r from-blue-300 to-green-300">
            About This Project
          </h1>
          <p className="text-xl text-white/70">
            Why I Built the WindBorne Constellation Monitor
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Purpose Section */}
          <section className="bg-white/10 p-6 md:p-8 rounded-xl shadow-lg backdrop-blur-sm border border-white/20">
            <div className="flex items-center mb-4">
              <Heart className="text-red-400 mr-3" size={28} />
              <h2 className="text-2xl font-bold">The Purpose</h2>
            </div>
            <p className="text-white/80 leading-relaxed mb-4">
              This application was created as my submission for the <strong>Junior Web Developer</strong> position at 
              <strong> WindBorne Systems</strong>—a company building the future of weather forecasting through 
              innovative balloon-based atmospheric sensing technology.
            </p>
            <p className="text-white/80 leading-relaxed">
              The challenge required me to query WindBorne's live constellation API, combine it with another public dataset, 
              and create something interesting that updates dynamically with the latest 24-hour data.
            </p>
          </section>

          {/* What It Does */}
          <section className="bg-white/10 p-6 md:p-8 rounded-xl shadow-lg backdrop-blur-sm border border-white/20">
            <div className="flex items-center mb-4">
              <Globe2 className="text-blue-400 mr-3" size={28} />
              <h2 className="text-2xl font-bold">What It Does</h2>
            </div>
            <p className="text-white/80 leading-relaxed mb-4">
              The WindBorne Constellation Monitor tracks thousands of weather balloons in real-time across the globe. 
              For each balloon, it displays:
            </p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Current position and altitude on an interactive map</li>
              <li>24-hour historical path visualization</li>
              <li>AI-powered journey analysis using Google's Gemini API</li>
              <li>Meteorological insights about each balloon's movement</li>
            </ul>
          </section>

          {/* Technical Features */}
          <section className="bg-white/10 p-6 md:p-8 rounded-xl shadow-lg backdrop-blur-sm border border-white/20">
            <div className="flex items-center mb-4">
              <Code className="text-green-400 mr-3" size={28} />
              <h2 className="text-2xl font-bold">Technical Highlights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center text-blue-300 mb-2">
                  <MapPin size={20} className="mr-2" />
                  <h3 className="font-semibold">Interactive Mapping</h3>
                </div>
                <p className="text-white/70 text-sm">
                  Leaflet.js for high-performance rendering of thousands of data points
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center text-green-300 mb-2">
                  <Sparkles size={20} className="mr-2" />
                  <h3 className="font-semibold">AI Integration</h3>
                </div>
                <p className="text-white/70 text-sm">
                  Google Gemini API for intelligent journey analysis
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center text-purple-300 mb-2">
                  <Database size={20} className="mr-2" />
                  <h3 className="font-semibold">Redis Caching</h3>
                </div>
                <p className="text-white/70 text-sm">
                  Fast data retrieval with intelligent cache management
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center text-yellow-300 mb-2">
                  <Zap size={20} className="mr-2" />
                  <h3 className="font-semibold">Serverless Backend</h3>
                </div>
                <p className="text-white/70 text-sm">
                  Scalable API built with Node.js and deployed on Vercel
                </p>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="bg-white/10 p-6 md:p-8 rounded-xl shadow-lg backdrop-blur-sm border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Tech Stack</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['React', 'Vite', 'Tailwind CSS', 'Leaflet.js', 'Node.js', 'Redis', 'Gemini AI', 'Vercel'].map((tech) => (
                <div key={tech} className="bg-gray-800/50 px-4 py-2 rounded-lg text-center text-white/80 font-medium">
                  {tech}
                </div>
              ))}
            </div>
          </section>

          {/* Why This Approach */}
          <section className="bg-white/10 p-6 md:p-8 rounded-xl shadow-lg backdrop-blur-sm border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Why This Approach?</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              I chose to integrate <strong>Google's Gemini AI</strong> as the external API because it adds genuine value 
              to the WindBorne data. Rather than just displaying raw coordinates, the AI provides contextual, meteorological 
              insights that help users understand <em>what the balloon's journey means</em>.
            </p>
            <p className="text-white/80 leading-relaxed">
              This combination showcases not just technical implementation, but also product thinking—creating an experience 
              that's educational, interactive, and genuinely useful for anyone interested in atmospheric science.
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pb-8">
          <p className="text-white/60">
            Built with passion for the WindBorne Systems Junior Web Developer position
          </p>
        </footer>
      </div>
    </div>
  );
}
