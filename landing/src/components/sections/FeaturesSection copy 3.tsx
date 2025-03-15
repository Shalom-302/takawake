import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '../../utils/motion';
import { Cpu, Rocket, Timer, Clipboard, ArrowsOutCardinal, ShieldStar } from '@phosphor-icons/react';

const features = [
  {
    title: "Automated CRUD",
    description: "Generate complete CRUD operations for your models with just a few lines of code.",
    icon: <ShieldStar size={40} weight="duotone" className="text-primary mb-5" />,
    imageKey: "on-premise"
  },
  {
    title: "Built-in Admin UI",
    description: "Ship with a powerful admin panel for managing your data without writing a single line of frontend code.",
    icon: <ArrowsOutCardinal size={40} weight="duotone" className="text-primary mb-5" />,
    imageKey: "single-tool"
  },
  {
    title: "Rapid Development",
    description: "Go from idea to production in minutes instead of days with our streamlined development flow",
    icon: <Timer size={40} weight="duotone" className="text-primary mb-5" />,
    imageKey: "observability"
  },
  {
    title: "Content Management",
    description: "Full-featured CMS capabilities with customizable fields, relations, and media handling",
    icon: <Clipboard size={40} weight="duotone" className="text-primary mb-5" />,
    imageKey: "content-management"
  },
  {
    title: "Extensible Architecture",
    description: "Modular design that grows with your application through a powerful plugin system",
    icon: <ArrowsOutCardinal size={40} weight="duotone" className="text-primary mb-5" />,
    imageKey: "extensible-architecture"
  },
  {
    title: "Enterprise Security",
    description: "Advanced authentication, permissions, and security features to keep your data safe",
    icon: <ShieldStar size={40} weight="duotone" className="text-primary mb-5" />,
    imageKey: "enterprise-security"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative bg-gradient-to-b from-gray-50 to-white overflow-hidden feature-section">
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
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeIn('up', index * 0.1 + 0.1)}
                className="glassmorphism p-6 rounded-sm relative overflow-hidden feature-card"
              >
                {/* {feature.icon} */}
                <h3 className="text-xl font-[500] mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                
                {/* Emplacement pour l'illustration */}
                <div className="mt-6 h-52 flex items-center justify-center">
                  <div className="w-full text-gray-200 opacity-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs">Illustration pour {feature.imageKey}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Call-to-action button */}
          <motion.div variants={fadeIn('up', 0.6)} className="text-center mt-16">
            <a href="#" className="inline-flex rounded-sm items-center gap-2 px-8 py-3 bg-primary text-white font-medium shadow-lg hover:shadow-xl transition-all">
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
