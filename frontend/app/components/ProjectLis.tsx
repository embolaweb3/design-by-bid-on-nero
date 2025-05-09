import React from 'react';

const ProjectList = ({ projects }:any) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {projects.map((project :any) => (
        <div key={project.id} className="p-4 border rounded-lg shadow-md">
          <h3 className="text-xl font-bold">{project.description}</h3>
          <p>Budget: {project.budget}</p>
          <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
          <button className="mt-2 p-2 bg-blue-500 text-white rounded-lg">
            View Details
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;