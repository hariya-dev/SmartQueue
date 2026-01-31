import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const user = authService.currentUserValue;
  const expectedRoles = route.data?.['roles'] as UserRole[];

  if (expectedRoles && expectedRoles.length > 0) {
    if (!user || !expectedRoles.includes(user.role)) {
      // Role not authorized, redirect to their default page
      switch (user?.role) {
        case UserRole.Admin:
          router.navigate(['/admin']);
          break;
        case UserRole.Doctor:
          router.navigate(['/calling-desk']);
          break;
        case UserRole.Kiosk:
          router.navigate(['/kiosk']);
          break;
        case UserRole.TV:
          router.navigate(['/tv-display']);
          break;
        case UserRole.TicketIssuer:
          router.navigate(['/ticket-issuer']);
          break;
        default:
          router.navigate(['/login']);
          break;
      }
      return false;
    }
  }

  return true;
};
