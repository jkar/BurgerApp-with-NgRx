import { Action } from "@ngrx/store";

export const LOGIN_START = '[AUTH] Login Start';
export const LOGIN = '[AUTH] Login';
export const LOGIN_FAIL = '[AUTH] Login Fail';
export const LOGOUT = '[AUTH] Logout';

export class Login implements Action {
    readonly type = LOGIN;

    constructor(public payload: { email: string; userId: string; token: string; expirartionDate: Date; }) {}
}

export class  Logout implements Action {
    readonly type = LOGOUT;
}

export class LoginStart implements Action {
    readonly type = LOGIN_START;
    constructor(public payload : {email: string, password: string}) {}
}

export class  LoginFail implements Action {
    readonly type = LOGIN_FAIL;
    constructor(public payload: string) {}
}

export type AuthActions = Login | Logout | LoginStart | LoginFail;