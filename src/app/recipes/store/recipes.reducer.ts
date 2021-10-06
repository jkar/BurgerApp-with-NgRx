import { Recipe } from "../recipe.model";
import * as RecipesActions from '../store/recipes.actions'; 

export interface State {
    recipes: Recipe[]; 
}

const initialState: State = {
    recipes: []
};

export function RecipesReducer(state: State = initialState, action: RecipesActions.RecipesActions) {

    switch(action.type) {
        case RecipesActions.SET_RECIPES:
            return {
                ...state,
                recipes: [...action.payload]
            };
        default:
            return state;
    }
}