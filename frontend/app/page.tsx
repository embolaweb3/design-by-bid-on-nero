"use client"

import { useEffect, useState } from 'react';
import { getSigner, getSupportedTokens, initAAClient, initAABuilder,
getProject, postProject, 
getAllProjects} from '../app/utilities/aaUtils';
import WalletConnect from './components/WalletConnect';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
// import { useContract } from '../app/utilities/contract';
import ProjectList from './components/ProjectList';
import PostProjectForm from './components/PostProjectForm';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [signer, setSigner] = useState<any | undefined>(undefined);
  const [eoaAddress, setEoaAddress] = useState<string>('');
  const [aaAddress, setAaAddress] = useState<string>('');
  const [supportedTokens, setSupportedTokens] = useState<Array<any>>([]);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);

  let walletConnector:any

  if(typeof window !=='undefined'){
    walletConnector = (window as any).ethereum
  }
  
  // const { fetchProjects } = useContract();

   // Load supported tokens when component mounts and signer is available
  useEffect(() => {
    const loadTokens = async () => {
      // Only run if signer is defined
      if (signer) {
        try {
          // Check if signer has getAddress method
          if (typeof signer.getAddress !== 'function') {
            console.error("Invalid signer: missing getAddress method");
            toast.error("Wallet connection issue: please reconnect your wallet");
            return;
          }

          // Verify signer is still connected by calling getAddress
          await signer.getAddress();

          // If connected, fetch tokens
          fetchSupportedTokens();
        } catch (error) {
          console.error("Signer validation error:", error);
          toast.error("Wallet connection issue: please reconnect your wallet");
        }
      } else {
        // Reset tokens if signer is not available
        setSupportedTokens([]);
        console.log("Signer not available, tokens reset");
      }
    };

    loadTokens();
  }, [signer]);

    useEffect(() => {
      if(!signer)return
    const loadProjects = async () => {
      const projects = await getAllProjects(signer);
      setProjects(projects); 
    };

    loadProjects();
  }, [projects]);

  const handleWalletConnected = async (eoaAddr: string, aaAddr: string) => {
    try {
      // Get the real signer from the wallet - don't use mock signers!
      const realSigner = await getSigner();

      setEoaAddress(eoaAddr);
      setAaAddress(aaAddr);
      setSigner(realSigner);

      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error("Error getting signer:", error);
      toast.error('Failed to get wallet signer. Please try again.');
    }
  };

   const fetchSupportedTokens = async () => {
    if (!signer) {
      console.log("Signer not available");
      return;
    }

    // Verify signer has getAddress method
    if (typeof signer.getAddress !== 'function') {
      console.error("Invalid signer: missing getAddress method");
      toast.error("Wallet connection issue: please reconnect your wallet");
      return;
    }

    try {
      setIsFetchingTokens(true);

      // Replace with your implementation based on the tutorial
      const client = await initAAClient(signer);
      const builder = await initAABuilder(signer);

      // Fetch supported tokens
      const tokens = await getSupportedTokens(client, builder);
      setSupportedTokens(tokens);
    } catch (error: any) {
      console.error("Error fetching supported tokens:", error);
      toast.error(`Token loading error: ${error.message || "Unknown error"}`);
    } finally {
      setIsFetchingTokens(false);
    }
  };

   const postingProject = async (projectData:any) => {
    if (!signer) return;

    const { description, budget, deadline, milestones } = projectData;

    try {
      const tx = await postProject(
        signer,
        description,
        ethers.utils.parseEther(budget),
        Math.floor(new Date(deadline).getTime() / 1000),
        milestones.map((milestone :any) => ethers.utils.parseEther(milestone))
      );
      if(tx.transactionHash){
      toast.success('Project posted successfully!');


      }
      // fetchProjects();
    } catch (error) {
      console.error("Error posting project:", error);
    }
  };




  return (
    <div className="container mx-auto">
      <WalletConnect onWalletConnected={handleWalletConnected} />
      <h1 className="text-3xl font-bold mb-6">DesignByBid Projects</h1>
      <PostProjectForm onSubmit={postingProject} />
      <ProjectList projects={projects} />
    </div>
  );
};

export default Home;