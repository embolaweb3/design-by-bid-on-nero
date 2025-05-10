"use client"
import { motion } from 'framer-motion';
import { FaHammer } from 'react-icons/fa';

export default function Header() {
  return (
    <motion.header 
      initial={{ y: -100 }} 
      animate={{ y: 0 }} 
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white shadow-lg flex justify-between items-center"
    >
      <motion.h1 
        whileHover={{ scale: 1.1 }}
        className="text-2xl font-bold flex items-center space-x-2"
      >
        <FaHammer className="w-8 h-8" />
        <span>DesignByBid</span>
      </motion.h1>
      {/* <ConnectButton /> */}
    </motion.header>
  );
}