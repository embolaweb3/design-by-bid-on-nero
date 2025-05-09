"use client"

import { useEffect, useState } from 'react';
// import { useContract } from '../app/utilities/contract';
import ProjectList from '../app/components/ProjectLis';

const Home = () => {
  const [projects, setProjects] = useState([]);

  let walletConnector:any

  if(typeof window !=='undefined'){
    walletConnector = (window as any).ethereum
  }
  
  const { fetchProjects } = useContract();

  useEffect(() => {
    const loadProjects = async () => {
      const projects = await fetchProjects();
      setProjects(projects); 
    };

    loadProjects();
  }, [fetchProjects]);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">DesignByBid Projects</h1>
      <ProjectList projects={projects} />
    </div>
  );
};

export default Home;