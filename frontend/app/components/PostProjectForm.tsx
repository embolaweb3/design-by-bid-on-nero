import { useState } from 'react';
import PaymentTypeSelector from './PaymentTypeSelector';
import { toast } from 'react-toastify';

export default function PostProjectForm({ onSubmit }: any) {
  const [formData, setFormData] = useState({
    description: '',
    budget: '',
    deadline: '',
    milestones: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'milestones' ? value.split(',') : value
    }));
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      toast.error('Please enter a project description');
      return false;
    }
    if (!formData.budget.trim() || isNaN(Number(formData.budget))) {
      toast.error('Please enter a valid budget in ETH');
      return false;
    }
    if (!formData.deadline) {
      toast.error('Please select a deadline');
      return false;
    }
    if (formData.milestones.length === 0 || formData.milestones.some(m => !m.trim() || isNaN(Number(m)))) {
      toast.error('Please enter valid milestones (comma-separated ETH values)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success('Project posted successfully!');
      // Reset form
      setFormData({
        description: '',
        budget: '',
        deadline: '',
        milestones: [],
      });
    } catch (error) {
      toast.error('Failed to post project. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border p-4 rounded-xl shadow-lg bg-white mb-6">
      <h3 className="text-xl font-semibold mb-4">Post a New Project</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="description"
          placeholder="Project Description"
          value={formData.description}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
          disabled={isSubmitting}
        />
        <input
          type="text"
          name="budget"
          placeholder="Budget (ETH)"
          value={formData.budget}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
          disabled={isSubmitting}
        />
        <input
          type="date"
          name="deadline"
          placeholder="Deadline"
          value={formData.deadline}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
          disabled={isSubmitting}
        />
        <input
          type="text"
          name="milestones"
          placeholder="Milestones in Eth (comma-separated)"
          value={formData.milestones.join(',')}
          onChange={handleChange}
          className="mb-2 p-2 border rounded w-full"
          disabled={isSubmitting}
        />
        {/* <PaymentTypeSelector /> */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`text-white p-2 rounded w-full mt-4 transition-colors ${
            isSubmitting
              ? 'bg-blue-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isSubmitting ? 'Posting...' : 'Post Project'}
        </button>
      </form>
    </div>
  );
}