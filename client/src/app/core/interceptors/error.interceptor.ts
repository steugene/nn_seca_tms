import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError, switchMap, catchError } from "rxjs";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.authService.refreshToken().pipe(
            switchMap((response) => {
              const authReq = req.clone({
                headers: req.headers.set(
                  "Authorization",
                  `Bearer ${response.accessToken}`,
                ),
              });
              return next.handle(authReq);
            }),
            catchError((_refreshError) => {
              this.authService.logout();
              this.router.navigate(["/auth/login"]);
              return throwError(() => error);
            }),
          );
        }

        return throwError(() => error);
      }),
    );
  }
}
