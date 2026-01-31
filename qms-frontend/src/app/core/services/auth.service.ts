import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, User, UserRole } from '../models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/Auth/login`, { username, password })
      .pipe(tap(response => {
        const user: User = {
          userId: response.userId,
          username: response.username,
          fullName: response.fullName,
          role: response.role,
          roomId: response.roomId,
          roomCode: response.roomCode,
          printerId: response.printerId,
          printerName: response.printerName,
          areaCode: response.areaCode,
          isActive: true
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.currentUserSubject.next(user);
      }));
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserValue;
    return user?.role === role;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  refreshToken(): Observable<LoginResponse> {
    const token = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    return this.http.post<LoginResponse>(`${this.baseUrl}/Auth/refresh`, { token, refreshToken })
      .pipe(tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      }));
  }

  // User Management
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/Auth/users`);
  }

  createUser(user: any): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/Auth/users`, user);
  }

  updateUser(id: number, user: any): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/Auth/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Auth/users/${id}`);
  }

  changePassword(request: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Auth/change-password`, request);
  }

  resetPassword(userId: number, request: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Auth/users/${userId}/reset-password`, request);
  }
}