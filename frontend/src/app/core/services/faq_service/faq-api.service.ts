import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  isApproved: boolean;
  askedBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FAQResponse {
  success: boolean;
  faqs?: FAQ[];
  faq?: FAQ;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FaqApiService {
  private readonly baseUrl = 'http://localhost:3000/api/faqs';

  constructor(private http: HttpClient) {}

  // Get approved FAQs (public)
  getApprovedFAQs(): Observable<FAQResponse> {
    return this.http.get<FAQResponse>(this.baseUrl);
  }

  // Add question (requires authentication)
  addQuestion(question: string): Observable<FAQResponse> {
    return this.http.post<FAQResponse>(this.baseUrl, { question });
  }

  // Admin methods
  getAllFAQs(): Observable<FAQResponse> {
    return this.http.get<FAQResponse>(`${this.baseUrl}/admin`);
  }

  updateFAQ(id: string, data: { question?: string; answer?: string; isApproved?: boolean }): Observable<FAQResponse> {
    return this.http.put<FAQResponse>(`${this.baseUrl}/admin/${id}`, data);
  }

  deleteFAQ(id: string): Observable<FAQResponse> {
    return this.http.delete<FAQResponse>(`${this.baseUrl}/admin/${id}`);
  }
}
