import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, Product } from '../../../core/services/admin_service/admin-service';
import { ProductService } from '../../../core/services/product_service/product-service';

@Component({
  selector: 'app-product-management',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-management.html',
  styleUrl: './product-management.css'
})
export class ProductManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  products: Product[] = [];
  categories: any[] = [];
  loading = false;
  errorMsg = '';
  successMsg = '';
  showAddForm = false;
  editingProduct: Product | null = null;
  selectedFile: File | null = null;

  productForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    price: ['', [Validators.required, Validators.min(0.01)]],
    category: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();

    this.adminService.products$.subscribe(products => {
      this.products = products;
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMsg = '';
    this.adminService.getAllProducts().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.adminService.setProducts(response.data);
        } else {
          this.errorMsg = response.message || 'Failed to load products';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error.error?.message || 'Error loading products';
      }
    });
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data;
        } else {
          this.errorMsg = 'Failed to load categories: ' + (response.message || 'Unknown error');
        }
      },
      error: (error) => {
        this.errorMsg = 'Error loading categories: ' + (error.error?.message || error.message || 'Unknown error');
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  showAddProductForm(): void {
    this.editingProduct = null;
    this.productForm.reset();
    this.selectedFile = null;
    this.showAddForm = true;
    this.errorMsg = '';
    this.successMsg = '';
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.productForm.patchValue({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category
    });
    this.selectedFile = null;
    this.showAddForm = true;
    this.errorMsg = '';
    this.successMsg = '';
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingProduct = null;
    this.productForm.reset();
    this.selectedFile = null;
    this.errorMsg = '';
    this.successMsg = '';
  }

  submitProduct(): void {
    if (this.productForm.invalid) {
      this.errorMsg = 'Please fill in all required fields correctly';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const formData = new FormData();
    formData.append('title', this.productForm.value.title!);
    formData.append('description', this.productForm.value.description!);
    formData.append('price', this.productForm.value.price!);
    formData.append('category', this.productForm.value.category!);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const operation = this.editingProduct
      ? this.adminService.updateProduct(this.editingProduct._id, formData)
      : this.adminService.addProduct(formData);

    operation.subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMsg = this.editingProduct ? 'Product updated successfully' : 'Product added successfully';
          this.loadProducts();
          this.cancelForm();
        } else {
          this.errorMsg = response.message || 'Operation failed';
        }
      },
      error: (error) => {
        this.loading = false;
        
        // If backend is not running, show helpful message
        if (error.status === 0 || error.status === undefined) {
          this.errorMsg = 'Backend server is not running. Please start your backend server first.';
        } else {
          this.errorMsg = error.error?.message || 'Operation failed';
        }
      }
    });
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Are you sure you want to delete "${product.title}"?`)) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.adminService.deleteProduct(product._id).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMsg = 'Product deleted successfully';
          this.loadProducts();
        } else {
          this.errorMsg = response.message || 'Failed to delete product';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error.error?.message || 'Error deleting product';
      }
    });
  }

  getImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:3000/${imagePath}`;
  }

}
