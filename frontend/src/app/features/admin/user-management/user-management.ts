import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, User } from '../../../core/services/admin_service/admin-service';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  
  users: User[] = [];
  loading = false;
  errorMsg = '';
  successMsg = '';
  isOwner = false;

  ngOnInit(): void {
    this.isOwner = this.adminService.isOwner();
    this.loadUsers();
    
    this.adminService.users$.subscribe(users => {
      this.users = users;
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMsg = '';
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.adminService.setUsers(response.users);
        } else {
          this.errorMsg = response.message || 'Failed to load users';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error.error?.message || 'Error loading users';
      }
    });
  }

  promoteUser(user: User): void {
    if (user.role === 'admin') {
      this.errorMsg = 'User is already an admin';
      return;
    }
    
    if (user.role === 'owner') {
      this.errorMsg = 'Cannot promote an owner';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    
    this.adminService.promoteUser(user._id).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMsg = response.message;
          this.loadUsers(); // Reload users
        } else {
          this.errorMsg = response.message || 'Failed to promote user';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error.error?.message || 'Error promoting user';
      }
    });
  }

  demoteUser(user: User): void {
    if (user.role === 'user') {
      this.errorMsg = 'User is already a regular user';
      return;
    }
    
    if (user.role === 'owner') {
      this.errorMsg = 'Cannot demote an owner';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    
    this.adminService.demoteUser(user._id).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMsg = response.message;
          this.loadUsers(); // Reload users
        } else {
          this.errorMsg = response.message || 'Failed to demote user';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error.error?.message || 'Error demoting user';
      }
    });
  }

  deleteUser(user: User): void {
    if (user.role === 'owner') {
      this.errorMsg = 'Cannot delete an owner';
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    
    this.adminService.deleteUser(user._id).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMsg = response.message;
          this.loadUsers(); // Reload users
        } else {
          this.errorMsg = response.message || 'Failed to delete user';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error.error?.message || 'Error deleting user';
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'owner': return 'badge bg-danger';
      case 'admin': return 'badge bg-warning';
      case 'user': return 'badge bg-primary';
      default: return 'badge bg-secondary';
    }
  }

  canPromote(user: User): boolean {
    return user.role === 'user' && this.isOwner;
  }

  canDemote(user: User): boolean {
    return user.role === 'admin' && this.isOwner;
  }

  canDelete(user: User): boolean {
    return user.role !== 'owner' && this.isOwner;
  }
}
