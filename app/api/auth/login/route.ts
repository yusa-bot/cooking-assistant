import { revalidatePath } from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/utils/supabase/server";

export async function POST(request:Request){
    const supabase = await createClient();

    const body = await request.json();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
    });
    if (error) {
        redirect("/auth/login");
    }
    revalidatePath("/","layout");
    redirect("/")
}