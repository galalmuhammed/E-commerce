import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, Category } from '../../../core/services/admin_service/admin-service';

@Component({
  selector: 'app-category-management',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-management.html',
  styleUrl: './category-management.css'
})
export class CategoryManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  
  categories: Category[] = [];
  loading = false;
  errorMsg = '';
  successMsg = '';
  showAddForm = false;
  editingCategory: Category | null = null;

  categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
  });

  ngOnInit(): void {
    this.loadCategories();
    
    this.adminService.categories$.subscribe(categories => {
      this.categories = categories;
    });
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMsg = '';
    this.adminService.getAllCategories().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.adminService.setCategories(response.data);
        } else {
          this.errorMsg = response.message || 'Failed to load categories';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error.error?.message || 'Error loading categories';
      }
    });
  }

  showAddCategoryForm(): void {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.showAddForm = true;
    this.errorMsg = '';
    this.successMsg = '';
  }

  editCategory(category: Category): void {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name
    });
    this.showAddForm = true;
    this.errorMsg = '';
    this.successMsg = '';
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingCategory = null;
    this.categoryForm.reset();
    this.errorMsg = '';
    this.successMsg = '';
  }

  submitCategory(): void {
    if (this.categoryForm.invalid) {
      this.errorMsg = 'Please enter a valid category name (2-50 characters)';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const categoryData = { name: this.categoryForm.value.name!.trim() };

    const operation = this.editingCategory 
      ? this.adminService.updateCategory(this.editingCategory._id, categoryData)
      : this.adminService.addCategory(categoryData);

    operation.subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMsg = this.editingCategory ? 'Category updated successfully' : 'Category added successfully';
          this.loadCategories();
          this.cancelForm();
        } else {
          this.errorMsg = response.message || 'Operation failed';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error.error?.message || 'Operation failed';
      }
    });
  }

  deleteCategory(category: Category): void {
    if (!confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    
    this.adminService.deleteCategory(category._id).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMsg = 'Category deleted successfully';
          this.loadCategories();
        } else {
          this.errorMsg = response.message || 'Failed to delete category';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error.error?.message || 'Error deleting category';
      }
    });
  }
}
