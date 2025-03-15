import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '../../utils/motion';
import { ChartLineUp, ChatTeardrop, Graph } from '@phosphor-icons/react';

const AdminSection = () => {
  return (
    <section id="admin" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-100 opacity-50"></div>
      
      {/* Formes géométriques décoratives */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-indigo-200 opacity-20 blur-xl"></div>
        <div className="absolute left-1/4 bottom-0 w-72 h-72 rounded-full bg-blue-300 opacity-20 blur-xl"></div>
        <div className="absolute right-1/4 top-1/3 w-64 h-64 rounded-full bg-gradient-to-r from-green-50 to-green-100 opacity-40"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={fadeIn('up')}>
            <h2 className="text-4xl md:text-5xl font-[400] text-center mb-6">
              Powerful Admin Dashboard
            </h2>
            <p className="text-lg md:text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">
              Manage your content, users, and data with an intuitive admin interface that requires zero configuration.
            </p>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            variants={fadeIn('up', 0.2)}
            className="dashboard-preview relative rounded-xl overflow-hidden shadow-2xl max-w-6xl mx-auto"
          >
            {/* Dashboard Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white">
                  <span className="font-bold">K</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Kaapi Admin</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">AD</span>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="dashboard-content bg-gray-50 p-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Users Stat Card */}
                <motion.div 
                  variants={fadeIn('up', 0.3)}
                  className="glassmorphism p-6 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-gray-600 font-medium">Active Users</h4>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-primary">
                      <ChartLineUp size={20} weight="fill" />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-gray-800">8,249</span>
                    <span className="text-green-500 text-sm mb-1">+5.2%</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">Compared to last month</div>
                </motion.div>

                {/* API Calls Stat Card */}
                <motion.div 
                  variants={fadeIn('up', 0.4)}
                  className="glassmorphism p-6 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-gray-600 font-medium">API Requests</h4>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Graph size={20} weight="fill" />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-gray-800">1.2M</span>
                    <span className="text-green-500 text-sm mb-1">+12.3%</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">Last 7 days</div>
                </motion.div>

                {/* Content Types Card */}
                <motion.div 
                  variants={fadeIn('up', 0.5)}
                  className="glassmorphism p-6 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-gray-600 font-medium">Content Types</h4>
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <ChatTeardrop size={20} weight="fill" />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-gray-800">14</span>
                    <span className="text-indigo-500 text-sm mb-1">Active</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">3 created this week</div>
                </motion.div>
              </div>

              {/* Content Management Table */}
              <motion.div 
                variants={fadeIn('up', 0.6)}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800">Recent Articles</h4>
                  <button className="text-primary text-sm font-medium">View all</button>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Published
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Getting Started with Kaapi
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">Sarah Johnson</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Tutorial
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Published
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        2 days ago
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          REST vs GraphQL in Kaapi
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">Michael Chen</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Deep Dive
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Draft
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        -
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Authentication Best Practices
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">Alex Rodriguez</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          Security
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Published
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        1 week ago
                      </td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div 
            variants={fadeIn('up', 0.7)}
            className="text-center mt-16"
          >
            <a href="#" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-medium rounded-sm shadow-sm hover:shadow-xl transition-all">
              Try the Admin Dashboard
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AdminSection;
