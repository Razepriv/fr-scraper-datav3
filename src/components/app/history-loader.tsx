
import { getHistory } from '@/lib/db';
import { HistoryTable } from './history-table';

export async function HistoryLoader() {
    const history = await getHistory();
    return <HistoryTable history={history} />;
}
