import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AuthScreen: React.FC = () => {
  const { login, isLoading, user } = useAuth();
  const [password, setPassword] = useState("");
  const [showHint, setShowHint] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user?.isAuthenticated) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(password);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-karat-50 to-karat-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-karat-200 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-block"
              >
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gold/10 mx-auto mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="h-10 w-10 text-gold"
                  >
                    <path d="M12 3c1.2-1.2 3-1.8 5-1a5 5 0 0 1 3 4c.2 1.2-.2 2.4-.6 3.4-.6 1.5-1.5 3-1.8 4.6-.2 1-.2 3-1.6 3a1.8 1.8 0 0 1-1.8-1.5L14 15" />
                    <path d="M10 15c-.6 1-1.6 1-2.4 1-1.4 0-2-.9-2.1-2-.1-.9 0-1.6.6-2.3.7-.7 1.3-1.4 1.8-2.2.4-.7.8-1.4 1-2.1.2-.7.3-1.6.2-2.4-.2-.9-.8-1.6-1.5-2" />
                    <path d="M6 8c-.4.4-.7 1.2-.6 1.8" />
                    <path d="M12 20v2" />
                    <path d="M8 18.9l-1.5 1.5" />
                    <path d="M16 18.9l1.5 1.5" />
                  </svg>
                </div>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl font-bold text-gray-900 tracking-tight"
              >
                KaratCloud
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-2 text-karat-600"
              >
                Gold Trading Management System
              </motion.p>
            </div>
            
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-karat-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-3 px-4 border border-karat-300 rounded-lg focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                {showHint && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-karat-500 mt-1"
                  >
                    Hint: For demo purposes, use "gold123"
                  </motion.p>
                )}
                <button 
                  type="button" 
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-karat-500 hover:text-karat-700 transition-colors mt-1"
                >
                  {showHint ? "Hide hint" : "Need a hint?"}
                </button>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gold hover:bg-gold-dark text-white font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.form>
          </div>
          
          <div className="px-8 py-4 bg-karat-50 border-t border-karat-100">
            <p className="text-xs text-center text-karat-500">
              © {new Date().getFullYear()} KaratCloud. Gold Trading Management System.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
