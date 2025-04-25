import {getHistoryById} from '@/lib/services/historyService';

export async function GET(_req: Request, { params }: { params: { id: string } }) {    
    const historyId = params.id
    try {
        const { data, error } = await getHistoryById(historyId);
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }, 
        })
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}