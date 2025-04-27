import {uploadImage} from "lib/services/imageService";
export async function POST(request:Request){
    const formData = await request.formData();
    const file = formData.get("file") as File;
    try {
        const imageUrl = await uploadImage(file);
        return new Response(JSON.stringify({ imageUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });


    }catch (error) {
        console.error("Error uploading image:", error);
        return new Response(JSON.stringify({ error: "Image upload failed" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}