const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-sm">
            © 2025 
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a 
              href="https://github.com/saimeers/automata-app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors">
                GitHub
            </a>
            <a  
                href="https://docs.google.com/document/d/1A6ZYRbuSjGtntfSBmNwId3UEGsII2ro4IP_T3ZHIEFo/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors">
                  Documentación
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;