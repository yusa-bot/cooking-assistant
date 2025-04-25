export interface Ingredient {
    name: string;
    amount: number;
    unit: string;
}

export interface Steps {    
    instruction: string;
    step_number: number;
    timer?: string;
}

export interface Recipe {
    id?: string;
    title:string;
    description?: string;
    ingredients: Ingredient[];
    steps: Steps[];   
    photo_url?: string;
    is_favorite: boolean;   
}

