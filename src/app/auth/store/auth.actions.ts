import { Action } from "@ngrx/store";

export const LOGIN_START = '[AUTH] Login Start';
export const AUTHENTICATE_SUCCESS = '[AUTH] Login';
export const AUTHENTICATE_FAIL = '[AUTH] Login Fail';
export const AUTO_LOGIN = '[AUTH] Auto Login';
export const LOGOUT = '[AUTH] Logout';
export const SIGNUP_START= '[AUTH] Signup Start';
export const CLEAR_ERROR = '[AUTH] Clear Error'

export class AuthenticateSuccess implements Action {
    readonly type = AUTHENTICATE_SUCCESS;

    constructor(public payload: { email: string; userId: string; token: string; expirartionDate: Date; }) {}
}

export class  Logout implements Action {
    readonly type = LOGOUT;
}

export class LoginStart implements Action {
    readonly type = LOGIN_START;
    constructor(public payload : {email: string, password: string}) {}
}

export class  AuthenticateFail implements Action {
    readonly type = AUTHENTICATE_FAIL;
    constructor(public payload: string) {}
}

export class SignupStart implements Action {
    readonly type = SIGNUP_START;

    constructor(public payload: { email: string; password: string }) {}
}

export class  ClearError implements Action {
    readonly type = CLEAR_ERROR
}

export class AutoLogin implements Action {
    readonly type = AUTO_LOGIN;
}

export type AuthActions = AuthenticateSuccess 
                        | Logout 
                        | LoginStart 
                        | AuthenticateFail 
                        | SignupStart 
                        | ClearError
                        | AutoLogin;