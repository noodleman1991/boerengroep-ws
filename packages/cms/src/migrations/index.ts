import * as migration_20261008_060100_initial from './20261008_060100_initial';
import * as migration_20261008_102426_cta_background from './20261008_102426_cta_background';
import * as migration_20261008_104251_settings_title from './20261008_104251_settings_title';

export const migrations = [
  {
    up: migration_20261008_060100_initial.up,
    down: migration_20261008_060100_initial.down,
    name: '20261008_060100_initial',
  },
  {
    up: migration_20261008_102426_cta_background.up,
    down: migration_20261008_102426_cta_background.down,
    name: '20261008_102426_cta_background',
  },
  {
    up: migration_20261008_104251_settings_title.up,
    down: migration_20261008_104251_settings_title.down,
    name: '20261008_104251_settings_title'
  },
];
