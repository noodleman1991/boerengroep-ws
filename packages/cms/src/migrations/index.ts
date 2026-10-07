import * as migration_20261007_230322_initial from './20261007_230322_initial';

export const migrations = [
  {
    up: migration_20261007_230322_initial.up,
    down: migration_20261007_230322_initial.down,
    name: '20261007_230322_initial'
  },
];
