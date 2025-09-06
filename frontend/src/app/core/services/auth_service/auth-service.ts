import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";

interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  data?: any;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly tokenKey = "auth_token";
  private readonly loginApi = "http://localhost:3000/api/login";
  private authSubject = new BehaviorSubject<boolean>(!!localStorage.getItem(this.tokenKey));
  readonly isAuthenticated$ = this.authSubject.asObservable();

  constructor(private http: HttpClient) {}

  private extractToken(res: LoginResponse): string | null {
    if (!res) return null;
    if (res.token) return res.token;
    if ((res as any).accessToken) return (res as any).accessToken;
    if (res.data && res.data.token) return res.data.token;
    if (res.data && (res.data as any).accessToken) return (res.data as any).accessToken;
    return null;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginApi, { username, password }).pipe(
      tap((res) => {
        const token = this.extractToken(res);
        if (token) {
          localStorage.setItem(this.tokenKey, token);
          this.authSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.authSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}


