import React from 'react';

const ProjectDetails = ({ project }:any) => {
  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold">{project.description}</h2>
      <p>Budget: {project.budget}</p>
      <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
      <h3 className="mt-4 text-xl font-bold">Bids:</h3>
      <ul>
        {project.bids.map((bid:any, index:any) => (
          <li key={index}>
            Bid by {bid.bidder}: {bid.bidAmount} - Completion Time: {bid.completionTime}
          </li>
        ))}
      </ul>
      <h3 className="mt-4 text-xl font-bold">Milestones:</h3>
      <ul>
        {project.milestones.map((milestone:any, index:any) => (
          <li key={index}>
            Milestone {index + 1}: {milestone} - Paid: {project.milestonePaid[index] ? "Yes" : "No"}
          </li>
        ))}
      </ul>
      <button className="mt-4 p-2 bg-green-500 text-white rounded-lg">
        Release Milestone Payment
      </button>
    </div>
  );
};

export default ProjectDetails;