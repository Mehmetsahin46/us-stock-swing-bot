import fs from 'fs';
import path from 'path';
import { DualPortfolioState } from './types';
import { INITIAL_DUAL_STATE } from './constants';

let globalState: DualPortfolioState = INITIAL_DUAL_STATE;
const TEMP_FILE_PATH = path.join(process.env.TMPDIR || '/tmp', 'dual_portfolio_state_v2.json');

export function getDualPortfolioState(): DualPortfolioState {
  try {
    if (fs.existsSync(TEMP_FILE_PATH)) {
      const fileData = fs.readFileSync(TEMP_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData) as DualPortfolioState;
      if (parsed && parsed.bist && parsed.us) {
        globalState = parsed;
        return globalState;
      }
    }
  } catch (err) {
    console.warn('Could not read from /tmp state file, using in-memory state:', err);
  }
  return globalState;
}

export function saveDualPortfolioState(newState: DualPortfolioState): void {
  globalState = newState;
  try {
    fs.writeFileSync(TEMP_FILE_PATH, JSON.stringify(newState, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist to /tmp state file:', err);
  }
}
