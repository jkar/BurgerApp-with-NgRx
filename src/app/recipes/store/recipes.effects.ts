import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { map, switchMap, withLatestFrom } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Recipe } from "../recipe.model";
import * as RecipesActions from './recipes.actions';
import * as fromApp from '../../store/app.reducer';

@Injectable()
export class RecipesEffects {

    @Effect()
    fetchRecipes = this.actions$.pipe(
        ofType(RecipesActions.FETCH_RECIPES),
        switchMap(() => {
            return this.http
                .get<Recipe[]>(
                environment.recipesUrl
            )
        }),
        map(recipes => {
            return recipes.map(recipe => {
              return {
                ...recipe,
                ingredients: recipe.ingredients ? recipe.ingredients : []
              };
            });
          }),
        map(recipes => {
              return new RecipesActions.SetRecipes(recipes);
          })
        )

    @Effect({ dispatch: false })
    storeRecipes = this.actions$.pipe(
      ofType(RecipesActions.STORE_RECIPES),
      withLatestFrom(this.store.select('recipes')),
      switchMap(([actionData, recipeState]) => {
        return this.http
        .put(
          environment.recipesUrl,
          recipeState.recipes
        )
      })
    )

    constructor(private actions$: Actions, private http: HttpClient, private store: Store<fromApp.AppState>) {}
}