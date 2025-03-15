import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '../../utils/motion';
import { ArrowRight } from '@phosphor-icons/react';

const CommunitySection = () => {
  return (
    <section id="community" className="py-24 bg-white relative">
      {/* Background geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-10 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-50 to-blue-100 opacity-30 blur-xl"></div>
        <div className="absolute -bottom-20 left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-50 to-purple-100 opacity-30 blur-xl"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-gradient-to-r from-green-50 to-blue-50 opacity-20"></div>
      </div>
      
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl mx-auto px-6 relative z-10"
      >
        <motion.div 
          variants={fadeIn('up')}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join the Kaapi Community
          </h2>
          <p className="text-lg mx-auto text-gray-600 max-w-3xl">
            Connect with thousands of developers, share knowledge, and get help from the community.
          </p>
        </motion.div>
        
        {/* Community Features */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {/* GitHub */}
          <motion.div
            variants={fadeIn('up', 0.1)}
            className="glassmorphism p-6 rounded-lg relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-100 to-transparent rounded-bl-full"></div>
            <div className="mb-6">
              <svg className="w-12 h-12 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Open Source</h3>
            <p className="text-gray-600 mb-6">
              Kaapi is fully open source. Contribute to our GitHub repository and help shape the future of the framework.
            </p>
            <a href="#" className="inline-flex items-center text-primary font-medium group-hover:text-indigo-700 transition-colors">
              Star on GitHub
              <ArrowRight className="ml-1 transition-transform group-hover:translate-x-1" size={18} />
            </a>
            {/* Bottom accent line with gradient */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>
          
          {/* Discord */}
          <motion.div
            variants={fadeIn('up', 0.2)}
            className="glassmorphism p-6 rounded-lg relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100 to-transparent rounded-bl-full"></div>
            <div className="mb-6">
              <svg className="w-12 h-12 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Discord Community</h3>
            <p className="text-gray-600 mb-6">
              Join our Discord server to chat with other Kaapi developers, get help, and share your projects.
            </p>
            <a href="#" className="inline-flex items-center text-primary font-medium group-hover:text-indigo-700 transition-colors">
              Join Discord
              <ArrowRight className="ml-1 transition-transform group-hover:translate-x-1" size={18} />
            </a>
            {/* Bottom accent line with gradient */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>
          
          {/* Forum */}
          <motion.div
            variants={fadeIn('up', 0.3)}
            className="glassmorphism p-6 rounded-lg relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full"></div>
            <div className="mb-6">
              <svg className="w-12 h-12 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Discussion Forum</h3>
            <p className="text-gray-600 mb-6">
              Our forum is the place to ask questions, share knowledge, and discuss best practices for Kaapi development.
            </p>
            <a href="#" className="inline-flex items-center text-primary font-medium group-hover:text-indigo-700 transition-colors">
              Visit Forum
              <ArrowRight className="ml-1 transition-transform group-hover:translate-x-1" size={18} />
            </a>
            {/* Bottom accent line with gradient */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>
        </motion.div>
        
        {/* Events and Newsletter */}
        <motion.div
          variants={fadeIn('up', 0.4)}
          className="glassmorphism p-8 rounded-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full"></div>
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-indigo-50 opacity-30 blur-xl"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Upcoming Events</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="min-w-[60px] h-16 rounded bg-indigo-50 flex flex-col items-center justify-center">
                    <span className="text-primary font-bold">Apr</span>
                    <span className="text-xl font-bold">15</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Kaapi Launch Webinar</h4>
                    <p className="text-gray-600 text-sm">Learn about the latest features in Kaapi 2.0</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="min-w-[60px] h-16 rounded bg-indigo-50 flex flex-col items-center justify-center">
                    <span className="text-primary font-bold">May</span>
                    <span className="text-xl font-bold">22</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Community Showcase</h4>
                    <p className="text-gray-600 text-sm">See what others are building with Kaapi</p>
                  </div>
                </li>
              </ul>
              <a href="#" className="inline-flex items-center text-primary font-medium mt-4 hover:text-indigo-700 transition-colors">
                View all events
                <ArrowRight className="ml-1 transition-transform group-hover:translate-x-1" size={18} />
              </a>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-4">Subscribe to Newsletter</h3>
              <p className="text-gray-600 mb-4">
                Get the latest Kaapi news, updates, and resources delivered to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </motion.div>
        
        {/* Main CTA */}
        <motion.div 
          variants={fadeIn('up', 0.5)}
          className="text-center mt-16"
        >
          <a href="#" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-indigo-600 text-white text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all">
            Join the Kaapi Community
            <ArrowRight size={20} weight="bold" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CommunitySection;
