import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth, User } from '../auth/auth';

@Component({
  selector: 'app-members',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './members.html',
  styleUrl: './members.css',
})
export class Members implements OnInit {
  users: User[] = [];
  incharges: User[] = [];
  currentUser: User | null = null;
  showAddForm = false;
  editingUser: User | null = null;
  userForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  sortColumn: string = 'username';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private authService: Auth,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      contactNumber: ['', Validators.required],
      liveMode: ['audio', Validators.required],
      role: ['MEMBER', Validators.required],
      watchLiveEnabled: [true],
      submitFeedbackEnabled: [true],
      submitAccountabilityEnabled: [true],
      inchargeId: [null],
    });
  }

  ngOnInit() {
    // Ensure user profile is loaded
    this.authService.ensureUserLoaded();

    // Check if user is already loaded
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      this.currentUser = currentUser;
      if (this.canManageMembers()) {
        this.loadUsers();
      } else {
        this.router.navigate(['/dashboard']);
      }
    }

    // Also subscribe for future updates
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        if (!this.canManageMembers()) {
          this.router.navigate(['/dashboard']);
        } else {
          // Load users only after user profile is loaded
          if (this.users.length === 0) {
            this.loadUsers();
          }
        }
      }
    });
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        // Extract incharges for the dropdown
        this.incharges = users.filter(u => u.role === 'INCHARGE');
        this.sortBy(this.sortColumn); // Apply current sort
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load users';
        this.cdr.detectChanges();
      }
    });
  }

  canManageMembers(): boolean {
    return this.currentUser?.role === 'ADMIN' || this.currentUser?.role === 'INCHARGE';
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  canEdit(user: User): boolean {
    if (this.currentUser?.role === 'ADMIN') {
      return user.role === 'INCHARGE' || user.role === 'MEMBER';
    }
    if (this.currentUser?.role === 'INCHARGE') {
      return user.role === 'MEMBER';
    }
    return false;
  }

  canDelete(user: User): boolean {
    if (this.currentUser?.id === user.id) {
      return false; // Cannot delete yourself
    }
    if (this.currentUser?.role === 'ADMIN') {
      return user.role === 'INCHARGE' || user.role === 'MEMBER';
    }
    if (this.currentUser?.role === 'INCHARGE') {
      return user.role === 'MEMBER';
    }
    return false;
  }

  showAdd() {
    this.showAddForm = true;
    this.editingUser = null;
    this.userForm.reset({
      liveMode: 'audio',
      role: 'MEMBER'
    });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.errorMessage = '';
    this.successMessage = '';
  }

  showEdit(user: User) {
    this.editingUser = user;
    this.showAddForm = true;
    this.userForm.patchValue({
      username: user.username,
      contactNumber: user.contactNumber,
      liveMode: user.liveMode,
      role: user.role,
      watchLiveEnabled: user.watchLiveEnabled,
      submitFeedbackEnabled: user.submitFeedbackEnabled,
      submitAccountabilityEnabled: user.submitAccountabilityEnabled,
      inchargeId: user.inchargeId || null,
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingUser = null;
    this.userForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  submitForm() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;

      // Remove password if empty during edit
      if (this.editingUser && !formData.password) {
        delete formData.password;
      }

      if (this.editingUser) {
        // Update user
        this.authService.updateUser(this.editingUser.id, formData).subscribe({
          next: () => {
            this.successMessage = 'User updated successfully';
            this.cancelForm();
            this.loadUsers();
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Failed to update user';
          }
        });
      } else {
        // Create user
        this.authService.createUser(formData).subscribe({
          next: () => {
            this.successMessage = 'User created successfully';
            this.cancelForm();
            this.loadUsers();
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Failed to create user';
          }
        });
      }
    }
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete ${user.username}?`)) {
      this.authService.deleteUser(user.id).subscribe({
        next: () => {
          this.successMessage = 'User deleted successfully';
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete user';
        }
      });
    }
  }

  exportCSV() {
    this.authService.exportUsersCSV().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.successMessage = 'Users exported successfully';
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to export users';
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        this.errorMessage = 'Please select a CSV file';
        return;
      }

      this.authService.importUsersCSV(file).subscribe({
        next: (result) => {
          if (result.imported > 0) {
            this.successMessage = `Successfully imported ${result.imported} user(s)`;
          }
          if (result.errors.length > 0) {
            this.errorMessage = `Errors:\n${result.errors.join('\n')}`;
          }
          this.loadUsers();
          // Reset file input
          event.target.value = '';
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to import users';
          event.target.value = '';
        }
      });
    }
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      // Toggle direction if same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.users.sort((a, b) => {
      let valueA: any = a[column as keyof User];
      let valueB: any = b[column as keyof User];

      // Handle null/undefined
      if (valueA === null || valueA === undefined) valueA = '';
      if (valueB === null || valueB === undefined) valueB = '';

      // Convert to lowercase for string comparison
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.cdr.detectChanges();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return '⇅';
    }
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }
}
