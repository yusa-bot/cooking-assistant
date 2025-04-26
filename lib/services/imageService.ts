import { createClient } from '@/utils/supabase/server'
import { randomUUID } from 'crypto'
import { useEffect } from 'react';
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
        
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('recipe-photos')
            .upload(filePath, image, {
                cacheControl: '3600',
                upsert: false,
                contentType: image.type
            })
        if (uploadError) {
            console.error("Supabase upload error:", uploadError)
            throw new Error("画像のアップロードに失敗しました: " + uploadError.message)
        }
        const {data} = supabase.storage.from('recipe-photos').getPublicUrl(filePath)
        const publicUrl = data.publicUrl
        return publicUrl

    }catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("画像のアップロードに失敗しました。");
    }
}