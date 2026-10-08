import * as migration_20261008_181609_initial from './20261008_181609_initial';

export const migrations = [
  {
    up: migration_20261008_181609_initial.up,
    down: migration_20261008_181609_initial.down,
    name: '20261008_181609_initial'
  },
];
