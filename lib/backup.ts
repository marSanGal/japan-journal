import { File, Paths } from 'expo-file-system';
import { useJournalStore } from './store';

const BACKUP_FILE = new File(Paths.document, 'backup.json');
const MIN_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

let lastWriteTime = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

async function writeBackup() {
  const now = Date.now();
  if (now - lastWriteTime < MIN_INTERVAL_MS) return;

  try {
    const json = useJournalStore.getState().exportData();
    BACKUP_FILE.write(json);
    lastWriteTime = now;
    useJournalStore.setState({ lastBackupTimestamp: new Date().toISOString() });
  } catch {
    // Silently fail — backup is best-effort
  }
}

function scheduleBackup() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(writeBackup, 5000);
}

export function initAutoBackup() {
  let prevDays = useJournalStore.getState().days;
  let prevEpilogue = useJournalStore.getState().epilogue;

  return useJournalStore.subscribe((state) => {
    if (state.days !== prevDays || state.epilogue !== prevEpilogue) {
      prevDays = state.days;
      prevEpilogue = state.epilogue;
      scheduleBackup();
    }
  });
}

export { BACKUP_FILE };
