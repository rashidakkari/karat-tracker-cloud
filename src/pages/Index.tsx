import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (user?.isAuthenticated) {
      navigate("/dashboard");
    } else {
      // Otherwise, redirect to auth page
      navigate("/auth");
    }
  }, [user, navigate]);

  // Return a minimal loading state since this is just a redirect page
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-karat-50 to-karat-100">
      <div className="animate-pulse text-karat-600 font-medium">Loading KaratCloud...</div>
    </div>
  );
};

export default Index;
