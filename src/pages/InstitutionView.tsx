import { InstitutionViewDashboard } from "@/components/InstitutionViewDashboard";
import { useNavigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";

export default function InstitutionView() {
  const navigate = useNavigate();
  const { currentPlatform } = usePlatform();
  
  const handleBackToProject = () => {
    // Navigate back to the platform-specific dashboard
    const dashboardPath = currentPlatform ? `/${currentPlatform}` : "/";
    navigate(dashboardPath);
  };

  return <InstitutionViewDashboard onBackToProject={handleBackToProject} />;
}