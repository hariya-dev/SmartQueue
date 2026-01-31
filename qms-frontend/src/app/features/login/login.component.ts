import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { UserRole } from '../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.currentUserValue;
      if (user) {
        this.redirectBasedOnRole(user.role);
      }
    }
  }

  onSubmit(): void {
    if (!this.username || !this.password) return;

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.redirectBasedOnRole(user.role);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 0) {
          this.error = 'Máy chủ không phản hồi. Vui lòng liên hệ bộ phận IT để kiểm tra.';
        } else if (err.status === 401 || err.status === 403) {
          this.error = 'Tên đăng nhập hoặc mật khẩu không đúng';
        } else {
          this.error = 'Có sự cố xảy ra. Vui lòng liên hệ bộ phận IT để được hỗ trợ.';
        }
        console.error('Login error:', err);
      }
    });
  }

  private redirectBasedOnRole(role: UserRole): void {
    switch (role) {
      case UserRole.Admin:
        this.router.navigate(['/admin']);
        break;
      case UserRole.Doctor:
        this.router.navigate(['/calling-desk']);
        break;
      case UserRole.TicketIssuer:
        this.router.navigate(['/ticket-issuer']);
        break;
      case UserRole.Kiosk:
        this.router.navigate(['/kiosk']);
        break;
      case UserRole.TV:
        this.router.navigate(['/tv-display']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}