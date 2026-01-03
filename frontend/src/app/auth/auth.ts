import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  contactNumber: string;
  liveMode: string;
  role: 'ADMIN' | 'INCHARGE' | 'MEMBER';
  watchLiveEnabled: boolean;
  submitFeedbackEnabled: boolean;
  submitAccountabilityEnabled: boolean;
  inchargeId?: number;
  incharge?: {
    id: number;
    username: string;
    role: string;
  };
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) {
      this.loadUserProfile();
    }
  }

  register(username: string, password: string, contactNumber: string, liveMode: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, {
      username,
      password,
      contactNumber,
      liveMode,
    }).pipe(
      tap(response => {
        this.setToken(response.access_token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      username,
      password,
    }).pipe(
      tap(response => {
        this.setToken(response.access_token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadUserProfile(): void {
    this.http.get<User>(`${this.apiUrl}/users/profile`).subscribe({
      next: user => this.currentUserSubject.next(user),
      error: () => {
        this.logout();
      }
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  ensureUserLoaded(): void {
    if (!this.currentUserSubject.value && this.isAuthenticated()) {
      this.loadUserProfile();
    }
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/profile`, data).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  createUser(userData: Partial<User> & { password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData);
  }

  updateUser(id: number, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/users/${id}`);
  }

  exportUsersCSV(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/users/export/csv`, {
      responseType: 'blob'
    });
  }

  importUsersCSV(file: File): Observable<{ imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imported: number; errors: string[] }>(
      `${this.apiUrl}/users/import/csv`,
      formData
    );
  }
}
