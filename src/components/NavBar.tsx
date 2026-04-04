import Link from 'next/link';

export default function NavBar({ dict }: { dict: any }) {
  return (
    <nav className="border-b border-white/10 bg-[#0a0f1e]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo del Departamento */}
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl tracking-wider transition-opacity hover:opacity-80">
              <span className="text-[#00d9a0]">E.E.S.T N°1</span> <span className="text-[#f1f5f9]">QUÍMICA</span>
            </Link>
          </div>

          {/* Enlaces de navegación */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <Link href="/" className="text-[#64748b] hover:text-[#00d9a0] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150">
                {dict?.nav?.home || "Inicio"}
              </Link>
              <Link href="/cart" className="text-[#64748b] hover:text-[#00d9a0] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150">
                {dict?.nav?.cart || "Carrito"}
              </Link>
              <Link href="/admin" className="text-[#7c3aed] hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium border border-white/10 transition-colors duration-150">
                {dict?.nav?.admin || "Panel Admin"}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}