"use client";
import { useState } from "react";
import { Menu as MenuIcon, X } from "lucide-react";

const MobileMenuToggle = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <MenuIcon />}
      </button>
      {isOpen && (
        <div className="fixed inset-x-0 top-[84px] bottom-0 z-40 flex">
          <div className="w-[110px] bg-[#EFEFEF]/70" />
          <div className="flex flex-1 flex-col items-end justify-between bg-white p-6">
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenuToggle;
