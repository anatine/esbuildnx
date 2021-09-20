const { getJestProjects } = require('@nrwl/jest');

module.exports = {
  projects: [...getJestProjects(), '<rootDir>/e2e/esbuildnx-e2e'],
};
