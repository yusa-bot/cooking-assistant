import { createClient } from '@/utils/supabase/server'
import { randomUUID } from 'crypto'
export async function uploadImage(image:File){
    const supabase = await createClient();

    try {
        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser();

        if (authError || !user) {
            throw authError ?? new Error("ユーザーが取得できませんでした。");
        }

        const userId = user.id;
        const fileExt = image.name.split('.').pop()
        const fileName = `${Date.now()}-${randomUUID()}.${fileExt}`
        const filePath = `${userId}/${fileName}`
        const {error} = await supabase
            .storage
            .from('recipe-photos')
            .upload(filePath,image)
        const {data} = supabase.storage.from('recipe-photos').getPublicUrl(filePath)
        const publicUrl = data.publicUrl
        return publicUrl

    }catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("画像のアップロードに失敗しました。");
    }
}