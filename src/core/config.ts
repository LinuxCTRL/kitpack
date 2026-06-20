import type { PacksConfig } from './types';
import { homedir } from 'os';
import { join } from 'path';

const DEFAULT_CONFIG: PacksConfig = {
  registry: 'local',
  localIndexDir: join(homedir(), '.kitpack', 'index'),
};

export function loadConfig(): PacksConfig {
  return DEFAULT_CONFIG;
}
