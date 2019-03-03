module.exports = {
  testMatch: ['**/*.spec.(j|t)s?(x)'],
  testPathIgnorePatterns: [],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx'],
  transform: {
    '^.+\\.(ts|js)$': 'babel-jest'
  }
}
