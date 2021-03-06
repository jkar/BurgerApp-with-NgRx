import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';

import { Recipe } from './recipe.model';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from './store/recipes.actions';
import { map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecipesResolverService implements Resolve<Recipe[]> {
  constructor(
    private store: Store<fromApp.AppState>,
    private actions$: Actions
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    //i cannot return this as it does not return an observable, (in reslovers we return observables)
    //and it executes in asynchrous
    // return this.store.dispatch(new RecipesActions.FetchRecipes());

    //tsekarei an uparxei idi sto state to recipes, an yparxei den travaei apo ton server, an den yparxei travaei ta recipes apo ton server 
    return this.store.select('recipes').pipe(
      take(1),
      map(recipesState => {
        return recipesState.recipes;
      }),
      switchMap(recipes => {
        if (recipes.length === 0) {
              //etsi kanw tin klisi kai otan erthoun ta recipes ,exw parakatw to actions$ (listener) panw sto SET_RECIPES action pou kaleitai otan exoun erthei ta recipes
              this.store.dispatch(new RecipesActions.FetchRecipes());
              //xerw oti otan to SET_RECIPES action klithei, exoun erthei ta recipes, giauto vazw ton listener panw sto action
              //to take(1) to vazw gia na ginei meta automatically unsubscribe
              return this.actions$.pipe(ofType(RecipesActions.SET_RECIPES), take(1))
        } else {
          return of(recipes);
        }
      })
    )
  }
}
