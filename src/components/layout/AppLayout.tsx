
import React, { useState, useEffect, ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar 
        isMobile={isMobile} 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
      />
      
      <motion.main 
        className={cn(
          "flex-1 overflow-auto",
          !isMobile && "transition-all duration-300 ease-in-out",
          !isMobile && (isSidebarOpen ? "ml-[240px]" : "ml-[80px]")
        )}
      >
        <div className="container px-4 py-6 mx-auto">
          {children}
        </div>
      </motion.main>
    </div>
  );
};

export default AppLayout;
