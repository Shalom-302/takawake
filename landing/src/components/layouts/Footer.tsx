


const Footer = () => {
  return(
    <footer className="bg-gray-100 py-20 border-t border-gray-200">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-2xl font-bold mb-6 text-primary">Kaapi</h3>
          <p className="text-gray-600">Modern API development platform built for speed and scalability.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Product</h4>
          <ul className="space-y-2">
            {['Features', 'Plugins', 'Templates', 'Pricing'].map(item => (
              <li key={item}><a href="#" className="text-gray-600 hover:text-gray-900">{item}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Resources</h4>
          <ul className="space-y-2">
            {['Documentation', 'Tutorials', 'Examples', 'Blog'].map(item => (
              <li key={item}><a href="#" className="text-gray-600 hover:text-gray-900">{item}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Connect</h4>
          <ul className="space-y-2">
            {['GitHub', 'Twitter', 'Discord', 'Contact'].map(item => (
              <li key={item}><a href="#" className="text-gray-600 hover:text-gray-900">{item}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 mt-16 pt-8 text-center text-gray-600">
        2024 Kaapi - Crafted for developers, powered by Kaanari
      </div>
    </div>
  </footer>
  )
}

export default Footer;