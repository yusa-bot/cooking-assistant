export interface Ingredient {
    name: string;
    amount: string;
    unit: string;
}

export interface Step {    
    instruction: string;
    step_number: number;
    timer?: string;
}

export interface Recipe {
    id?: string;
    title:string;
    description?: string;
    ingredients: Ingredient[];
    steps: Step[];   
    photo_url?: string;
    is_favorite: boolean;   
}

