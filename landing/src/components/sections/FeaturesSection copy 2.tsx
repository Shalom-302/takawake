import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '../../utils/motion';
import { Cpu, Rocket, Timer, Clipboard, ArrowsOutCardinal, ShieldStar } from '@phosphor-icons/react';

const features = [
  {
    title: "On-premise deployment",
    description: "Retain full control over your data and ensure adherence to regulatory compliance requirements with the ability to implement custom security measures",
    icon: <ShieldStar size={40} weight="duotone" />,
    imageKey: "on-premise"
  },
  {
    title: "A single tool for all of your needs",
    description: "Experience the ease of streamlining your AI application development process with Kaapi's all-in-one solution, empowering you to effortlessly oversee the entire development cycle",
    icon: <ArrowsOutCardinal size={40} weight="duotone" />,
    imageKey: "single-tool"
  },
  {
    title: "Observability",
    description: "Enhance operational efficiency with real-time insights, key metrics tracking, and streamlined debugging processes through our comprehensive observability suite",
    icon: <Clipboard size={40} weight="duotone" />,
    imageKey: "observability"
  },
  {
    title: "Seamless LLM fine-tuning",
    description: "Transform from relying on generic LLMs to curating fine models you build and customize as your property. Achieve rapid fine-tuning and deployment of open-source LLMs with just two clicks to train state-of-the-art models",
    icon: <Cpu size={40} weight="duotone" />,
    imageKey: "fine-tuning"
  },
  {
    title: "Guardrails",
    description: "Ensure the safety and reliability of your LLM outputs with thorough validation to align outcomes with expectations, complemented by comprehensive visibility and risk assessment",
    icon: <Timer size={40} weight="duotone" />,
    imageKey: "guardrails"
  },
  {
    title: "Bring your data",
    description: "Integrate your documents from external sources using Kaapi to enhance the robustness of conversational applications by efficiently retrieving and incorporating relevant information",
    icon: <Rocket size={40} weight="duotone" />,
    imageKey: "your-data"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative z-10"
        >
          <motion.div variants={fadeIn('up')} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-[400] text-gray-900 mb-6">
            Empower your development with API superpowers
            </h2>
            <div className="flex justify-center">
              <a href="#" className="flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors">
                Start for free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0L6.59 1.41L12.17 7H0V9H12.17L6.59 14.59L8 16L16 8L8 0Z" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn('up', index * 0.1 + 0.1)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6 pb-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>
                </div>
                
                {/* Placeholder pour l'illustration que l'utilisateur ajoutera */}
                <div className="w-full h-48 bg-gray-50 flex items-center justify-center">
                  {/* L'utilisateur remplacera cet élément par ses propres illustrations */}
                  <div className="text-gray-300">
                    {feature.icon}
                    <div className="text-xs mt-2 text-gray-400">Emplacement pour {feature.imageKey}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
