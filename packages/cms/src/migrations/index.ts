import * as migration_20261008_181609_initial from './20261008_181609_initial';
import * as migration_20261012_100730_media_storage_columns from './20261012_100730_media_storage_columns';

export const migrations = [
  {
    up: migration_20261008_181609_initial.up,
    down: migration_20261008_181609_initial.down,
    name: '20261008_181609_initial',
  },
  {
    up: migration_20261012_100730_media_storage_columns.up,
    down: migration_20261012_100730_media_storage_columns.down,
    name: '20261012_100730_media_storage_columns'
  },
];
