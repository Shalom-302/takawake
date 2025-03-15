import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '../../utils/motion';
import { Cpu, Rocket, Timer, Clipboard, ArrowsOutCardinal, ShieldStar } from '@phosphor-icons/react';

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative bg-light overflow-hidden feature-section">
      <div className="max-w-7xl mx-auto">      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={fadeIn('up')}>
            <h2 className="text-4xl md:text-4xl font-[400] font-instrument text-left mb-2">
            Empower your development with API superpowers
            </h2>
            <p className="text-lg md:text-lg text-gray-600 text-left max-w-4xl mb-16">
            From automated CRUD to a built-in admin UI and a modular architecture, it streamlines your workflow and accelerates development.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {/* Feature Card 1 */}
            <motion.div 
              variants={fadeIn('up', 0.1)}
              className="glassmorphism p-6 rounded-sm relative overflow-hidden feature-card"
            >
              <Cpu size={40} weight="duotone" className="text-primary mb-5" />
              <h3 className="text-xl font-[500] mb-3">Automated CRUD</h3>
              <p className="text-gray-600 mb-4">
                Generate complete CRUD operations for your models with just a few lines of code.
              </p>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div 
              variants={fadeIn('up', 0.2)}
              className="glassmorphism p-6 rounded-sm relative overflow-hidden feature-card"
            >
              <Rocket size={40} weight="duotone" className="text-primary mb-5" />
              <h3 className="text-xl font-[500] mb-3">Built-in Admin UI</h3>
              <p className="text-gray-600 mb-4">
                Ship with a powerful admin panel for managing your data without writing a single line of frontend code.
              </p>
            </motion.div>

            {/* Feature Card 3 */}
            <motion.div 
              variants={fadeIn('up', 0.3)}
              className="glassmorphism p-6 rounded-sm relative overflow-hidden feature-card"
            >
              <Timer size={40} weight="duotone" className="text-primary mb-5" />
              <h3 className="text-xl font-[500] mb-3">Rapid Development</h3>
              <p className="text-gray-600 mb-4">
                Go from idea to production in minutes instead of days with our streamlined development flow.
              </p>
            </motion.div>

            {/* Feature Card 4 */}
            <motion.div 
              variants={fadeIn('up', 0.4)}
              className="glassmorphism p-6 rounded-sm relative overflow-hidden feature-card"
            >
              <Clipboard size={40} weight="duotone" className="text-primary mb-5" />
              <h3 className="text-xl font-[500] mb-3">Content Management</h3>
              <p className="text-gray-600 mb-4">
                Full-featured CMS capabilities with customizable fields, relations, and media handling.
              </p>
            </motion.div>

            {/* Feature Card 5 */}
            <motion.div 
              variants={fadeIn('up', 0.5)}
              className="glassmorphism p-6 rounded-sm relative overflow-hidden feature-card"
            >
              <ArrowsOutCardinal size={40} weight="duotone" className="text-primary mb-5" />
              <h3 className="text-xl font-[500] mb-3">Extensible Architecture</h3>
              <p className="text-gray-600 mb-4">
                Modular design that grows with your application through a powerful plugin system.
              </p>
            </motion.div>

            {/* Feature Card 6 */}
            <motion.div 
              variants={fadeIn('up', 0.6)}
              className="glassmorphism p-6 relative overflow-hidden feature-card"
            >
              <ShieldStar size={40} weight="duotone" className="text-primary mb-5" />
              <h3 className="text-xl font-[500] mb-3">Enterprise Security</h3>
              <p className="text-gray-600 mb-4">
                Advanced authentication, permissions, and security features to keep your data safe.
              </p>
            </motion.div>
          </motion.div>

          {/* Call-to-action button */}
          <motion.div variants={fadeIn('up', 0.6)} className="text-center mt-16">
            <a href="#" className="inline-flex rounded-sm items-center gap-2 px-8 py-3 bg-primary text-white font-medium  shadow-lg hover:shadow-xl transition-all">
              Explore all features
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
