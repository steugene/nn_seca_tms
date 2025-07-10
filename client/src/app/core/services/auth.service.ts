import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { Router } from "@angular/router";
import { User, LoginDto, RegisterDto, AuthResponse } from "@nn-seca-tms/shared";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "http://localhost:3000/api/auth";
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        this.currentUserSubject.next(parsedUser);
      } catch (error) {
        this.logout();
      }
    }
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.setAuthData(response);
          this.router.navigate(["/dashboard"]);
        }),
      );
  }

  register(userData: RegisterDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap((response) => {
          this.setAuthData(response);
          this.router.navigate(["/dashboard"]);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    this.currentUserSubject.next(null);
    this.router.navigate(["/auth/login"]);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem("refresh_token");
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap((response) => {
          this.setAuthData(response);
        }),
      );
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem("access_token", response.accessToken);
    localStorage.setItem("refresh_token", response.refreshToken);
    localStorage.setItem("user", JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return (
      !!this.currentUserSubject.value && !!localStorage.getItem("access_token")
    );
  }

  getToken(): string | null {
    return localStorage.getItem("access_token");
  }
}
