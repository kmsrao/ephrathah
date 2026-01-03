import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth, User } from '../auth/auth';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    // Ensure user profile is loaded
    this.authService.ensureUserLoaded();

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // If user is not loaded but token exists, redirect to login
      if (!user && !this.authService.isAuthenticated()) {
        this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  canManageMembers(): boolean {
    return this.currentUser?.role === 'ADMIN' || this.currentUser?.role === 'INCHARGE';
  }
}
