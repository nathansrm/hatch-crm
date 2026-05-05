const MobileHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex min-h-16 w-full items-center border-b border-white/[0.07] bg-[#0A0F1E]/95 px-3 py-2 shadow-[0_14px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      {children}
    </header>
  );
};

export default MobileHeader;
