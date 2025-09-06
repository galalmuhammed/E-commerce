import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'owner';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private usersSubject = new BehaviorSubject<User[]>([]);
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);

  users$ = this.usersSubject.asObservable();
  products$ = this.productsSubject.asObservable();
  categories$ = this.categoriesSubject.asObservable();

  // User Management
  getAllUsers(): Observable<any> {
    return this.http.get('http://localhost:3000/api/user');
  }

  promoteUser(userId: string): Observable<any> {
    return this.http.put(`http://localhost:3000/api/user/promote/${userId}`, {});
  }

  demoteUser(userId: string): Observable<any> {
    return this.http.put(`http://localhost:3000/api/user/demote/${userId}`, {});
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`http://localhost:3000/api/user/${userId}`);
  }

  // Product Management
  getAllProducts(): Observable<any> {
    return this.http.get('http://localhost:3000/api/products');
  }

  addProduct(productData: FormData): Observable<any> {
    return this.http.post('http://localhost:3000/api/products', productData);
  }

  updateProduct(productId: string, productData: FormData): Observable<any> {
    return this.http.put(`http://localhost:3000/api/products/${productId}`, productData);
  }

  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`http://localhost:3000/api/products/${productId}`);
  }

  // Category Management
  getAllCategories(): Observable<any> {
    return this.http.get('http://localhost:3000/api/categories');
  }

  addCategory(categoryData: { name: string }): Observable<any> {
    return this.http.post('http://localhost:3000/api/categories', categoryData);
  }

  updateCategory(categoryId: string, categoryData: { name: string }): Observable<any> {
    return this.http.put(`http://localhost:3000/api/categories/${categoryId}`, categoryData);
  }

  deleteCategory(categoryId: string): Observable<any> {
    return this.http.delete(`http://localhost:3000/api/categories/${categoryId}`);
  }

  // State Management
  setUsers(users: User[]): void {
    this.usersSubject.next(users);
  }

  setProducts(products: Product[]): void {
    this.productsSubject.next(products);
  }

  setCategories(categories: Category[]): void {
    this.categoriesSubject.next(categories);
  }

  getCurrentUserRole(): string | null {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (error) {
      return null;
    }
  }

  isOwner(): boolean {
    return this.getCurrentUserRole() === 'owner';
  }
}
