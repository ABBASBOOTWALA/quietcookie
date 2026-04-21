export type DietaryFilter = 'vegetarian' | 'vegan' | 'gluten-free' | 'keto';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimated_cost_usd: number;
}

export interface Recipe {
  dish_name: string;
  description: string;
  prep_time: string;
  cook_time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  tips: string[];
  total_estimated_cost_usd: number;
}

export type AppState = 'idle' | 'generating' | 'done' | 'error';

export interface ChefAttribution {
  id: string;
  name: string;
  title: string;
  nationality: string;
  gradient: string;
  handle?: string;
}
