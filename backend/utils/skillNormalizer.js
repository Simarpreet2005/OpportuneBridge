const SYNONYMS = {
  'react.js': 'react',
  'node.js': 'node',
  'vue.js': 'vue',
  'express.js': 'express',
  'mongodb': 'mongo',
  'postgresql': 'postgres',
  'javascript': 'js',
  'typescript': 'ts',
  'html5': 'html',
  'css3': 'css',
  'angular.js': 'angular',
  'angularjs': 'angular'
};

export const normalizeSkill = (skill) => {
  if (!skill) return '';
  const normalized = skill.toLowerCase().trim();
  return SYNONYMS[normalized] || normalized;
};

export const normalizeSkillsArray = (skills) => {
  if (!skills || !Array.isArray(skills)) return [];
  return [...new Set(skills.map(normalizeSkill).filter(Boolean))];
};
