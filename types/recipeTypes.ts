export interface IngredientTypes {
    user_id?: string;
    name: string;
    amount?: string;
    unit?: string;
}

export interface StepTypes {  
    user_id?: string;     
    instruction: string;
    step_number: number;
    timer?: string;
}

export interface RecipeTypes {
    id: string;
    user_id?: string;
    title:string;
    description?: string;
    ingredients: IngredientTypes[];
    steps: StepTypes[];   
    photo_url?: string;
    is_favorite: boolean;
    created_at?: string;   
}

export interface GeneratedRecipeTypes{
    key:number;
    title: string;
    ingredients: IngredientTypes[];
    steps: StepTypes[];
}