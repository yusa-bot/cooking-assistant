import { createClient } from '@/utils/supabase/server'

export async function getAllHistory() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('history')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data
    } catch (err: any) {
        throw new Error(err.message)
    }
}

export async function getHistoryById(historyId: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('history')
            .select('*')
            .eq('id', historyId)
            .single()

        if (error) throw new Error(error.message)
        return data
    } catch (err: any) {
        throw new Error(err.message)
    }
}

export async function createHistory(inputHistoryData: any) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('history')
            .insert({
                recipe_id: inputHistoryData.recipe_id,
                user_id: inputHistoryData.user_id,
            })

        if (error) throw new Error(error.message)
        return data
    } catch (err: any) {
        throw new Error(err.message)
    }
}