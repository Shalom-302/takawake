import { motion } from 'framer-motion';
import { fadeIn } from '../../utils/motion';
import Terminal from '../Terminal';
import TypingEffect from '../TypeWriter';

const InstallSection = () => {
  const installTypingMessage = [
    { text: '<span class="text-secondary">kaapi plugin install security</span>', pauseAfter: 800 }
  ];

  return (
    <section id="install" className="py-32 relative">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          variants={fadeIn('up', 0.7)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 p-8 text-white max-w-4xl mx-auto rounded-lg shadow-xl relative overflow-hidden"
        >
          {/* Éléments de design abstrait */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Formes géométriques */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
            <div className="absolute left-1/4 bottom-0 w-48 h-48 rounded-full bg-white opacity-5"></div>
            <div className="absolute -bottom-8 right-1/4 w-32 h-32 rounded-full bg-white opacity-10"></div>
            
            {/* Lignes subtiles */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-white via-transparent to-white opacity-10"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-6">Install any plugin with a simple command</h3>
            
            <Terminal path="~/kaapi $" className='mb-4 min-h-12 max-w-3xl mx-auto'>
              <TypingEffect messages={installTypingMessage} speed={80} delay={800} />
            </Terminal>
            
            <p className="text-white text-opacity-90 mb-8">Plugins are automatically configured with sensible defaults but can be fully customized for your specific needs.</p>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-300"></span>
                <span className="text-sm">Zero-config setup</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-300"></span>
                <span className="text-sm">Automatic dependency resolution</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-300"></span>
                <span className="text-sm">Modular architecture</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Getting Started Steps */}
        <motion.div
          variants={fadeIn('up', 0.2)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h3 className="text-3xl font-bold text-center mb-10">Get Started in Minutes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="glassmorphism p-6 rounded-lg relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">1</div>
              <h4 className="text-xl font-semibold mb-3 mt-2">Install Kaapi</h4>
              <Terminal path="~$" className="mb-4 text-xs">
                <div className="whitespace-nowrap overflow-x-auto">pip install kaapi-framework</div>
              </Terminal>
              <p className="text-gray-600 text-sm">
                Install Kaapi with pip and get instant access to all core features.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="glassmorphism p-6 rounded-lg relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">2</div>
              <h4 className="text-xl font-semibold mb-3 mt-2">Create Project</h4>
              <Terminal path="~$" className="mb-4 text-xs">
                <div className="whitespace-nowrap overflow-x-auto">kaapi create my-api</div>
              </Terminal>
              <p className="text-gray-600 text-sm">
                Generate a new project with the CLI tool with sensible defaults.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="glassmorphism p-6 rounded-lg relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">3</div>
              <h4 className="text-xl font-semibold mb-3 mt-2">Launch API</h4>
              <Terminal path="~/my-api$" className="mb-4 text-xs">
                <div className="whitespace-nowrap overflow-x-auto">kaapi start</div>
              </Terminal>
              <p className="text-gray-600 text-sm">
                Run your API and access the admin dashboard at http://localhost:5000/admin.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <a href="#" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all">
              View Full Installation Guide
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InstallSection;
