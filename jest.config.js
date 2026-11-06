module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@op-engineering/op-sqlite$':
      '<rootDir>/node_modules/@op-engineering/op-sqlite/node/dist/index.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@op-engineering/op-sqlite|react-native-reanimated|react-native-worklets)/)',
  ],
};
