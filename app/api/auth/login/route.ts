import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
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
