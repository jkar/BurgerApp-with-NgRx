import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import * as AuthActions from '../store/auth.actions';


export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
  }

@Injectable()
export class AuthEffects {
    //Actions: big observable that gives access to all dispatch actions
    //we don't call subscribe, ngrx will automatically subscribe to this observable
    //ofType, filters the action or actions that we pass in (continues to the observable chain we create, only if the action is inside the parameters)
    //with switchMap, we create another observable in the chain
    //we return the AuthActions.Login action wich is dispathced automatically by the ngrx effect

    // !!!!!!!!! this observale must not die with catch error, because it won't be created a new one observable !!!
    //that's why i return a new observable in the catchError with the of attribute

    //NGRX will automatically subscribe to it
    //here we pipe to all dispatch actions
    @Effect()
    authLogin = this.actions$.pipe(
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) => {
            return this.http
            .post<AuthResponseData>(
              environment.LogInUrl,
              {
                email: authData.payload.email,
                password: authData.payload.password,
                returnSecureToken: true
              }
            ).pipe(
                map(resData => {
                    const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
                    return new AuthActions.Login({ email: resData.email, userId: resData.localId, token: resData.idToken, expirartionDate: expirationDate });
                }),
                catchError(errorRes => {
                    let errorMessage = 'An unknown error occurred!';
                    if (!errorRes.error || !errorRes.error.error) {
                      return of(new AuthActions.LoginFail(errorMessage));
                    }
                    switch (errorRes.error.error.message) {
                      case 'EMAIL_EXISTS':
                        errorMessage = 'This email exists already';
                        break;
                      case 'EMAIL_NOT_FOUND':
                        errorMessage = 'This email does not exist.';
                        break;
                      case 'INVALID_PASSWORD':
                        errorMessage = 'This password is not correct.';
                        break;
                    }
                    return of( new AuthActions.LoginFail(errorMessage));
                })
            )
        }
    ));

    //epd de theloume na kanei dispatch kapoio action, alla na kanei mono navigate, thetoume to dispatch sto false
    @Effect({ dispatch: false })
    authSuccess = this.actions$.pipe(ofType(AuthActions.LOGIN), tap(() => {
        this.router.navigate(['/']);
    }));

    constructor(private actions$: Actions, private http: HttpClient, private router: Router) {}

}