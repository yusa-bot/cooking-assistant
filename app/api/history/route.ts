import { getAllHistory, createHistory } from '@/lib/services/historyService'

export async function GET() {
    try {
        const history = await getAllHistory()
        return new Response(JSON.stringify(history), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    }
    catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}

export async function POST(request: Request) {
    try {
        const inputHistoryData = await request.json();
        const result = await createHistory(inputHistoryData);
        return new Response(JSON.stringify(result), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        })        
    }
    catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}