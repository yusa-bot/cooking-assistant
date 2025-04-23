import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const body = await request.json();
    console.log(body);
    const { data, error } = await supabase.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
            data: {
                full_name: body.userName,  
            },
        },
    });

    if (error) {
        return NextResponse.json({ 
            success: false,
            error: error.message 
        }, { status: 400 });
    }

    return NextResponse.json({ 
        success: true,
        data 
    });
}
