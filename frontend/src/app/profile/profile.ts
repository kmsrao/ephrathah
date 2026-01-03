import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth, User } from '../auth/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  isEditing = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      password: ['', [Validators.minLength(6)]],
      contactNumber: ['', Validators.required],
      liveMode: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({
          contactNumber: user.contactNumber,
          liveMode: user.liveMode,
        });
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';
  }

  onUpdateProfile() {
    if (this.profileForm.valid) {
      const updates: any = {
        contactNumber: this.profileForm.value.contactNumber,
        liveMode: this.profileForm.value.liveMode,
      };

      if (this.profileForm.value.password) {
        updates.password = this.profileForm.value.password;
      }

      this.authService.updateProfile(updates).subscribe({
        next: () => {
          this.successMessage = 'Profile updated successfully';
          this.isEditing = false;
          this.profileForm.patchValue({ password: '' });
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Update failed';
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
