import { readCachedProjectGraph } from '@nrwl/devkit';

export const getNxProject = (name: string) => {
  const graph = readCachedProjectGraph();
  const project = graph.nodes[name];

  if (!project) throw 'Project not found.';

  return project;
};
