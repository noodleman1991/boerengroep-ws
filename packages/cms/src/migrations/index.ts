import * as migration_20261008_110137_initial from './20261008_110137_initial';

export const migrations = [
  {
    up: migration_20261008_110137_initial.up,
    down: migration_20261008_110137_initial.down,
    name: '20261008_110137_initial'
  },
];
