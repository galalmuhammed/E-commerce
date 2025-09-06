import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FaqApiService, FAQ } from '../../core/services/faq_service/faq-api.service';
import { AuthService } from '../../core/services/auth_service/auth-service';

@Component({
  selector: 'app-faq',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class Faq implements OnInit {
  faqs: FAQ[] = [];
  newQuestion: string = '';
  isSubmitting: boolean = false;
  isAuthenticated: boolean = false;

  constructor(
    private faqService: FaqApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadFAQs();
  }

  loadFAQs() {
    this.faqService.getApprovedFAQs().subscribe({
      next: (response) => {
        if (response.success && response.faqs) {
          this.faqs = response.faqs;
        }
      },
      error: (error) => {
        // Handle error silently
      }
    });
  }

  submitQuestion(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    // Validation
    if (!this.newQuestion || !this.newQuestion.trim()) {
      alert('Please enter a question.');
      return;
    }
    
    if (this.isSubmitting) {
      return;
    }

    if (!this.isAuthenticated) {
      alert('Please login first to submit a question.');
      return;
    }

    this.isSubmitting = true;
    
    // Try the real API first
    this.faqService.addQuestion(this.newQuestion.trim()).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.newQuestion = '';
          alert('✅ Question submitted successfully! It will be reviewed and answered by admin.');
        } else {
          alert('❌ Error: ' + (response.message || 'Failed to submit question'));
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        
        if (error.status === 401) {
          alert('❌ Authentication failed. Please login again.');
        } else {
          alert('❌ Error submitting question: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      }
    });
  }

}
