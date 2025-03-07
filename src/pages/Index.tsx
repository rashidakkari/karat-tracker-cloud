
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-4xl px-4"
      >
        <h1 className="text-5xl font-bold text-amber-800 mb-6">
          KaratCloud <span className="text-amber-500">Gold Management</span>
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Streamline your gold trading business with our comprehensive
          inventory, transaction, and analytics platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600"
          >
            Get Started
          </Button>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            variant="outline"
            className="border-amber-500 text-amber-700 hover:bg-amber-100"
          >
            Login
          </Button>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl px-4"
      >
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-amber-700 mb-3">Inventory Management</h3>
          <p className="text-gray-600">
            Track your gold inventory with precision. Manage items by weight, karat, and value.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-amber-700 mb-3">Transaction Tracking</h3>
          <p className="text-gray-600">
            Record all sales, purchases, and exchanges with detailed analytics and reporting.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-amber-700 mb-3">Price Calculator</h3>
          <p className="text-gray-600">
            Calculate gold values instantly based on weight, purity, and current market prices.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
