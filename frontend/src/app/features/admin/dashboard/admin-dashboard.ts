import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin_service/admin-service';
import { UserManagementComponent } from '../user-management/user-management';
import { ProductManagementComponent } from '../product-management/product-management';
import { CategoryManagementComponent } from '../category-management/category-management';
import { TestimonialManagementComponent } from '../testimonial-management/testimonial-management';
import { FaqManagementComponent } from '../faq-management/faq-management';
import { ContactManagementComponent } from '../contact-management/contact-management';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, UserManagementComponent, ProductManagementComponent, CategoryManagementComponent, TestimonialManagementComponent, FaqManagementComponent, ContactManagementComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  
  activeTab: 'users' | 'products' | 'categories' | 'testimonials' | 'faqs' | 'contacts' = 'users';
  isOwner = false;

  ngOnInit(): void {
    this.isOwner = this.adminService.isOwner();
    this.loadUsers();
  }

  onTabChange(tab: 'users' | 'products' | 'categories' | 'testimonials' | 'faqs' | 'contacts'): void {
    this.activeTab = tab;
    if (tab === 'users') {
      this.loadUsers();
    } else if (tab === 'products') {
      this.loadProducts();
    } else if (tab === 'categories') {
      this.loadCategories();
    }
    // Testimonials, FAQs, and Contacts will load their own data when their components initialize
  }

  private loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.adminService.setUsers(response.users);
        }
      },
      error: (error) => {
        // Handle error silently
      }
    });
  }

  private loadProducts(): void {
    this.adminService.getAllProducts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.adminService.setProducts(response.data);
        }
      },
      error: (error) => {
        // Handle error silently
      }
    });
  }

  private loadCategories(): void {
    this.adminService.getAllCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.adminService.setCategories(response.data);
        }
      },
      error: (error) => {
        // Handle error silently
      }
    });
  }
}
