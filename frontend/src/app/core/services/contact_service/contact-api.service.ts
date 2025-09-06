import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isAnswered: boolean;
  isRead: boolean;
  answer: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContactResponse {
  success: boolean;
  contact?: Contact;
  contacts?: Contact[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactApiService {
  private readonly baseUrl = 'http://localhost:3000/api/contact';

  constructor(private http: HttpClient) {}

  // Submit contact form (requires authentication)
  submitContact(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.baseUrl, contactData);
  }

  // Admin methods
  getAllContacts(): Observable<ContactResponse> {
    return this.http.get<ContactResponse>(`${this.baseUrl}/admin`);
  }

  markAsRead(id: string): Observable<ContactResponse> {
    return this.http.put<ContactResponse>(`${this.baseUrl}/admin/${id}/read`, {});
  }

  deleteContact(id: string): Observable<ContactResponse> {
    return this.http.delete<ContactResponse>(`${this.baseUrl}/admin/${id}`);
  }
}
