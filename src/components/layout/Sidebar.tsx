
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  Database, 
  BarChart4, 
  Calculator, 
  FileSpreadsheet,
  Factory,
  Settings,
  LogOut,
  ChevronLeft,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, isOpen, onToggle }) => {
  const location = useLocation();
  const { logout } = useAuth();
  
  // Create navigation items
  const navItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/",
    },
    {
      name: "Inventory",
      icon: <Database className="h-5 w-5" />,
      href: "/inventory",
    },
    {
      name: "Transactions",
      icon: <BarChart4 className="h-5 w-5" />,
      href: "/transactions",
    },
    {
      name: "Calculator",
      icon: <Calculator className="h-5 w-5" />,
      href: "/calculator",
    },
    {
      name: "Reports",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      href: "/reports",
    },
    {
      name: "Factory",
      icon: <Factory className="h-5 w-5" />,
      href: "/factory",
    },
    {
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
    },
  ];
  
  const isActive = (href: string) => location.pathname === href;

  const sidebarVariants = {
    open: { 
      width: "240px",
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    closed: { 
      width: "80px",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };
  
  const mobileSidebarVariants = {
    open: { 
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    closed: { 
      x: "-100%",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}
      
      {/* Mobile menu button */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-white rounded-full p-2 shadow-md border border-karat-100"
          onClick={onToggle}
        >
          <Menu className="h-6 w-6 text-karat-800" />
        </button>
      )}
      
      {/* Sidebar */}
      <motion.div
        variants={isMobile ? mobileSidebarVariants : sidebarVariants}
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : "closed"}
        className={cn(
          "fixed h-full bg-white border-r border-karat-100 flex flex-col z-40 shadow-sm overflow-hidden",
          isMobile ? "left-0 top-0 bottom-0 w-[240px]" : "h-screen"
        )}
      >
        {/* Logo and toggle */}
        <div className="p-4 flex items-center justify-between">
          <AnimatePresence>
            {(isOpen || isMobile) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="h-5 w-5 text-gold"
                  >
                    <path d="M12 3c1.2-1.2 3-1.8 5-1a5 5 0 0 1 3 4c.2 1.2-.2 2.4-.6 3.4-.6 1.5-1.5 3-1.8 4.6-.2 1-.2 3-1.6 3a1.8 1.8 0 0 1-1.8-1.5L14 15" />
                    <path d="M10 15c-.6 1-1.6 1-2.4 1-1.4 0-2-.9-2.1-2-.1-.9 0-1.6.6-2.3.7-.7 1.3-1.4 1.8-2.2.4-.7.8-1.4 1-2.1.2-.7.3-1.6.2-2.4-.2-.9-.8-1.6-1.5-2" />
                    <path d="M6 8c-.4.4-.7 1.2-.6 1.8" />
                    <path d="M12 20v2" />
                    <path d="M8 18.9l-1.5 1.5" />
                    <path d="M16 18.9l1.5 1.5" />
                  </svg>
                </div>
                <span className="font-bold text-xl text-karat-900">KaratCloud</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isMobile && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggle}
              className="h-8 w-8 rounded-full"
            >
              <ChevronLeft className={cn(
                "h-5 w-5 transition-transform duration-300",
                !isOpen && "rotate-180"
              )} />
            </Button>
          )}
        </div>
        
        <Separator />
        
        {/* Navigation items */}
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group",
                  isActive(item.href)
                    ? "text-karat-900 bg-karat-100"
                    : "text-karat-600 hover:text-karat-900 hover:bg-karat-50"
                )}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <AnimatePresence>
                    {(isOpen || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                
                {isActive(item.href) && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute left-0 w-1 h-8 bg-gold rounded-r-full"
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>
        
        <Separator />
        
        {/* Logout button */}
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={logout}
            className={cn(
              "w-full justify-start text-karat-600 hover:text-karat-900 hover:bg-karat-50",
              !isOpen && !isMobile && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 mr-2" />
            <AnimatePresence>
              {(isOpen || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
