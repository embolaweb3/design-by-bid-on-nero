"use client"

import { useEffect, useState } from 'react';
import {
  getSigner, getSupportedTokens, initAAClient, initAABuilder,
  getProject, postProject,
  getAllProjects,
  isFirstTimePoster
} from '../app/utilities/aaUtils';
import WalletConnect from './components/WalletConnect';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
// import { useContract } from '../app/utilities/contract';
import ProjectList from './components/ProjectList';
import ProjectCard from './components/ProjectCard';
import PostProjectForm from './components/PostProjectForm';
import PaymentTypeSelector from './components/PaymentTypeSelector';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [signer, setSigner] = useState<any | undefined>(undefined);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);
  const [eoaAddress, setEoaAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const [aaAddress, setAaAddress] = useState<string>('');
  // payment type states
  const [paymentType, setPaymentType] = useState(0);
  const [selectedToken, setSelectedToken] = useState('');
  const [supportedTokens, setSupportedTokens] = useState<Array<any>>([]);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);

  let walletConnector: any

  if (typeof window !== 'undefined') {
    walletConnector = (window as any).ethereum
  }


  // Load supported tokens when component mounts and signer is available
  useEffect(() => {
    setIsLoading(true);
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
          const projects = await getAllProjects(signer);
          setProjects(projects);
          const userType = await isFirstTimePoster(signer, aaAddress) ? true : false;
          setIsFirstTimeUser(userType)
          setIsLoading(false);
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

  const postingProject = async (projectData: any) => {
    if (!signer) return;
    const paymentType = await isFirstTimePoster(signer, aaAddress) ? 0 : 1;
    const { description, budget, deadline, milestones } = projectData;

    try {
      const tx = await postProject(
        signer,
        description,
        ethers.utils.parseEther(budget),
        Math.floor(new Date(deadline).getTime() / 1000),
        milestones.map((milestone: any) => ethers.utils.parseEther(milestone)),
        paymentType
      );
      if (tx.transactionHash) {
        toast.success('Project posted successfully!');
        const projects = await getAllProjects(signer);
        setProjects(projects);
        const userType = await isFirstTimePoster(signer, aaAddress) ? true : false;
        setIsFirstTimeUser(userType)
      }
      // fetchProjects();
    } catch (error: any) {
      toast.error(error.message)
      console.error("Error posting project:", error);
    }
  };

  /**
   * Handle payment type change
   */
  const handlePaymentTypeChange = (type: number, token?: string) => {
    setPaymentType(type);
    if (token) {
      setSelectedToken(token);
    } else {
      setSelectedToken('');
    }
  };




  return (
    <div className="container mx-auto">
      <WalletConnect onWalletConnected={handleWalletConnected} />
      <PostProjectForm onSubmit={postingProject} paymentType={paymentType}
        setPaymentType={handlePaymentTypeChange}
        selectedToken={selectedToken} setSelectedToken={setSelectedToken}
        supportedTokens={supportedTokens} isLoading={isFetchingTokens} isFirstTimeUser={isFirstTimeUser} />
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 mb-6 border-b-4 border-nero-blue pb-2">
        🚀 DesignByBid Projects
      </h1>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nero-blue" />
        </div>
      ) : (
        <>
          {projects.length === 0 ? (
            <p className="text-center text-gray-500">No projects found.</p>
          ) : (
            projects.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </>
      )}
    </div>
  );
};

export default Home;