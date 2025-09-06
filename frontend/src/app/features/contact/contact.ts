import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactApiService } from '../../core/services/contact_service/contact-api.service';
import { AuthService } from '../../core/services/auth_service/auth-service';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact implements OnInit {
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  isSubmitting: boolean = false;
  isAuthenticated: boolean = false;

  constructor(
    private contactService: ContactApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  submitContact(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    // Validation
    if (!this.isFormValid()) {
      alert('Please fill in all required fields.');
      return;
    }
    
    if (this.isSubmitting) {
      return;
    }

    if (!this.isAuthenticated) {
      alert('Please login first to submit a message.');
      return;
    }

    this.isSubmitting = true;
    
    // Try the real API first
    this.contactService.submitContact(this.contactForm).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.resetForm();
          alert('✅ Your message has been submitted successfully! We will get back to you soon.');
        } else {
          alert('❌ Error: ' + (response.message || 'Failed to submit message'));
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        
        if (error.status === 401) {
          alert('❌ Authentication failed. Please login again.');
        } else {
          alert('❌ Error submitting message: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      }
    });
  }


  isFormValid(): boolean {
    return !!(
      this.contactForm.name.trim() &&
      this.contactForm.email.trim() &&
      this.contactForm.subject.trim() &&
      this.contactForm.message.trim()
    );
  }

  resetForm() {
    this.contactForm = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }
}
