import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TestimonialApiService, Testimonial } from '../../core/services/testimonial_service/testimonial-api.service';
import { AuthService } from '../../core/services/auth_service/auth-service';

@Component({
  selector: 'app-testimonials',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css'
})
export class Testimonials implements OnInit {
  testimonials: Testimonial[] = [];
  newTestimonial: string = '';
  isSubmitting: boolean = false;
  isAuthenticated: boolean = false;

  constructor(
    private testimonialService: TestimonialApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.testimonialService.getApprovedTestimonials().subscribe({
      next: (response) => {
        if (response.success && response.testimonials) {
          this.testimonials = response.testimonials;
        }
      },
      error: (error) => {
        // Handle error silently
      }
    });
  }

  submitTestimonial(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    // Validation
    if (!this.newTestimonial || !this.newTestimonial.trim()) {
      alert('Please enter a testimonial message.');
      return;
    }
    
    if (this.isSubmitting) {
      return;
    }

    if (!this.isAuthenticated) {
      alert('Please login first to submit a testimonial.');
      return;
    }

    this.isSubmitting = true;
    
    // Try the real API first
    this.testimonialService.addTestimonial(this.newTestimonial.trim()).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.newTestimonial = '';
          alert('✅ Testimonial submitted successfully! It will be reviewed by admin before being displayed.');
        } else {
          alert('❌ Error: ' + (response.message || 'Failed to submit testimonial'));
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        
        if (error.status === 401) {
          alert('❌ Authentication failed. Please login again.');
        } else {
          alert('❌ Error submitting testimonial: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      }
    });
  }


}
