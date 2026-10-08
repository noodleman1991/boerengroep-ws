import * as migration_20261008_060100_initial from './20261008_060100_initial';

export const migrations = [
  {
    up: migration_20261008_060100_initial.up,
    down: migration_20261008_060100_initial.down,
    name: '20261008_060100_initial'
  },
];
