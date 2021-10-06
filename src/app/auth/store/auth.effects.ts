import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { AuthService } from "../auth.service";
import * as AuthActions from '../store/auth.actions';
import { User } from "../user.model";


export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
  }

  const handleAuthentication = (expiresIn: number, email: string, userId: string, token: string) => {
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    localStorage.setItem('userData', JSON.stringify(user));
    return new AuthActions.AuthenticateSuccess({ email: email, userId: userId, token: token, expirartionDate: expirationDate, redirect: true });
  }

  const handleError = (errorRes: any) => {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return of(new AuthActions.AuthenticateFail(errorMessage));
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
    return of( new AuthActions.AuthenticateFail(errorMessage));
  }

@Injectable()
export class AuthEffects {

    @Effect()
    authSignup = this.actions$.pipe(
        ofType(AuthActions.SIGNUP_START),
        switchMap((signupAction: AuthActions.SignupStart) => {
            return this.http
            .post<AuthResponseData>(
              environment.signUpUrl,
              {
                email: signupAction.payload.email,
                password: signupAction.payload.password,
                returnSecureToken: true
              }
            ).pipe(
                tap(resData => {
                    this.authService.setLogoutTimer(+resData.expiresIn * 1000);
                }),
                map(resData => {
                   return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
                }),
                catchError(errorRes => {
                   return handleError(errorRes);
                })
            )
        })
    );

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
                tap(resData => {
                    this.authService.setLogoutTimer(+resData.expiresIn * 1000);
                }),
                map(resData => {
                   return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
                }),
                catchError(errorRes => {
                   return handleError(errorRes);
                })
            )
        }
    ));

    //epd de theloume na kanei dispatch kapoio action, alla na kanei mono navigate, thetoume to dispatch sto false
    @Effect({ dispatch: false })
    authRedirect = this.actions$.pipe(ofType(AuthActions.AUTHENTICATE_SUCCESS), tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
      if (authSuccessAction.payload.redirect) {
        this.router.navigate(['/']);
      }
    }));

    @Effect()
    autoLogin = this.actions$.pipe(ofType(AuthActions.AUTO_LOGIN), map(() => {
        const userData: {
            email: string;
            id: string;
            _token: string;
            _tokenExpirationDate: string;
          } = JSON.parse(localStorage.getItem('userData'));
          if (!userData) {
              //I JUST HAVE TO RETURN AN OBJECT WITH A TYPE PROPERTY, IF USERDATA ARE EMPTY
            return { type: 'DUMMY' };;
          }
      
          const loadedUser = new User(
            userData.email,
            userData.id,
            userData._token,
            new Date(userData._tokenExpirationDate)
          );
      
          if (loadedUser.token) {
            const expirationDuration =
            new Date(userData._tokenExpirationDate).getTime() -
            new Date().getTime();
            this.authService.setLogoutTimer(expirationDuration);
            return new AuthActions.AuthenticateSuccess({
                                                        email: loadedUser.email, 
                                                        userId: loadedUser.id, 
                                                        token: loadedUser.token, 
                                                        expirartionDate: new Date(userData._tokenExpirationDate),
                                                        redirect: false
                                                      });
          }

          //I JUST HAVE TO RETURN AN OBJECT WITH A TYPE PROPERTY, IF LOADUSER.TOKEN DO NOT EXISTS
          return { type: 'DUMMY' };
    }));

    //epd de theloume na kanei dispatch kapoio action, alla na afairesei to authentication apto localstorage
    @Effect({ dispatch: false })
    authLogout = this.actions$.pipe(ofType(AuthActions.LOGOUT), tap(() => {
        this.authService.clearLogoutTimer();
        localStorage.removeItem('userData');
        this.router.navigate(['/auth']);
    }));

    constructor(private actions$: Actions, private http: HttpClient, private router: Router, private authService: AuthService) {}

}