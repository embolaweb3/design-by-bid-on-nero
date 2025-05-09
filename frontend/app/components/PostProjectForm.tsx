import { useState } from 'react';
import PaymentTypeSelector from './PaymentTypeSelector';


export default function PostProjectForm({ onSubmit }:any) {
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [milestones, setMilestones] = useState<string[]>([]);

  const handleSubmit = () => {
    onSubmit({ description, budget, deadline, milestones });
  };

  return (
    <div className="border p-4 rounded-xl shadow-lg bg-white mb-6">
      <h3 className="text-xl font-semibold mb-4">Post a New Project</h3>
      <input
        type="text"
        placeholder="Project Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-2 p-2 border rounded w-full"
      />
      <input
        type="text"
        placeholder="Budget (ETH)"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        className="mb-2 p-2 border rounded w-full"
      />
      <input
        type="date"
        placeholder="Deadline"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="mb-2 p-2 border rounded w-full"
      />
      <input
        type="text"
        placeholder="Milestones (comma-separated)"
        value={milestones}
        onChange={(e) => setMilestones(e.target.value.split(','))}
        className="mb-2 p-2 border rounded w-full"
      />
      {/* <PaymentTypeSelector /> */}
      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white p-2 rounded w-full mt-4"
      >
        Post Project
      </button>
    </div>
  );
}