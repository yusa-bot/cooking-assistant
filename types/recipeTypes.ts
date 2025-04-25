export interface IngredientTypes {
    name: string;
    amount: string;
    unit: string;
}

export interface StepTypes {    
    instruction: string;
    step_number: number;
    timer?: string;
}

export interface RecipeTypes {
    id?: string;
    title:string;
    description?: string;
    ingredients: IngredientTypes[];
    steps: StepTypes[];   
    photo_url?: string;
    is_favorite: boolean;   
}


export interface GeneratedRecipeTypes{
    key:number;
    title: string;
    ingredients: IngredientTypes[];
    steps: StepTypes[];
}