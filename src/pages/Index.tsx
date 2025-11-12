import React, { useState } from "react";
import ProjectDashboard from "@/components/ProjectDashboard";
import VendorDiscovery, { Project } from "@/components/VendorDiscovery";


const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  if (selectedProject) {
    return (
      <VendorDiscovery 
        project={selectedProject} 
        onBackToProjects={handleBackToProjects}
      />
    );
  }

  return <ProjectDashboard onSelectProject={handleSelectProject} />;
};

export default Index;