const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-sm">
            © 2025 
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Documentación</a>
            <a href="#" className="hover:text-white transition-colors">Sobre el proyecto</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;