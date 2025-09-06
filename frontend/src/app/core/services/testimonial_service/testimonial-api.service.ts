import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Testimonial {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  message: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialResponse {
  success: boolean;
  testimonials?: Testimonial[];
  testimonial?: Testimonial;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialApiService {
  private readonly baseUrl = 'http://localhost:3000/api/testimonials';

  constructor(private http: HttpClient) {}

  // Get approved testimonials (public)
  getApprovedTestimonials(): Observable<TestimonialResponse> {
    return this.http.get<TestimonialResponse>(this.baseUrl);
  }

  // Add testimonial (requires authentication)
  addTestimonial(message: string): Observable<TestimonialResponse> {
    return this.http.post<TestimonialResponse>(this.baseUrl, { message });
  }

  // Admin methods
  getAllTestimonials(): Observable<TestimonialResponse> {
    return this.http.get<TestimonialResponse>(`${this.baseUrl}/admin`);
  }

  updateTestimonial(id: string, data: { message?: string; isApproved?: boolean }): Observable<TestimonialResponse> {
    return this.http.put<TestimonialResponse>(`${this.baseUrl}/admin/${id}`, data);
  }

  deleteTestimonial(id: string): Observable<TestimonialResponse> {
    return this.http.delete<TestimonialResponse>(`${this.baseUrl}/admin/${id}`);
  }
}
