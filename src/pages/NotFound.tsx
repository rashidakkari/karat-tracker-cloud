
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50">
      <h1 className="text-6xl font-bold text-amber-800 mb-4">404</h1>
      <p className="text-2xl text-gray-700 mb-8">Page not found</p>
      <p className="text-gray-600 mb-8 max-w-md text-center">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Button 
        onClick={() => navigate('/')}
        className="bg-amber-500 hover:bg-amber-600"
      >
        Go Back Home
      </Button>
    </div>
  );
};

export default NotFound;
