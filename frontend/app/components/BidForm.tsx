import React, { useState } from 'react';

const BidForm = ({ onSubmit }:any) => {
  const [bidAmount, setBidAmount] = useState('');
  const [completionTime, setCompletionTime] = useState('');

  const handleSubmit = (e:any) => {
    e.preventDefault();
    onSubmit({ bidAmount, completionTime });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-md">
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Bid Amount</label>
        <input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          className="p-2 border rounded-lg w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Completion Time (days)</label>
        <input
          type="number"
          value={completionTime}
          onChange={(e) => setCompletionTime(e.target.value)}
          className="p-2 border rounded-lg w-full"
          required
        />
      </div>
      <button type="submit" className="p-2 bg-blue-500 text-white rounded-lg">
        Submit Bid
      </button>
    </form>
  );
};

export default BidForm;