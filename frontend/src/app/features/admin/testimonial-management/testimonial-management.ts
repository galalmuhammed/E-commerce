import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestimonialApiService, Testimonial } from '../../../core/services/testimonial_service/testimonial-api.service';

@Component({
  selector: 'app-testimonial-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './testimonial-management.html',
  styleUrl: './testimonial-management.css'
})
export class TestimonialManagementComponent implements OnInit {
  testimonials: Testimonial[] = [];
  selectedTestimonial: Testimonial | null = null;
  isEditing: boolean = false;
  loading = false;
  errorMsg = '';
  successMsg = '';
  editForm = {
    message: '',
    isApproved: false
  };

  constructor(private testimonialService: TestimonialApiService) {}

  ngOnInit() {
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    
    this.testimonialService.getAllTestimonials().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.testimonials) {
          this.testimonials = response.testimonials;
        } else {
          this.errorMsg = response.message || 'Failed to load testimonials';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = 'Error loading testimonials: ' + (error.error?.message || error.message || 'Unknown error');
      }
    });
  }

  editTestimonial(testimonial: Testimonial) {
    this.selectedTestimonial = testimonial;
    this.editForm = {
      message: testimonial.message,
      isApproved: testimonial.isApproved
    };
    this.isEditing = true;
    this.errorMsg = '';
    this.successMsg = '';
  }

  saveTestimonial() {
    if (!this.selectedTestimonial) return;

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.testimonialService.updateTestimonial(this.selectedTestimonial._id, this.editForm).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMsg = 'Testimonial updated successfully!';
          this.loadTestimonials();
          this.cancelEdit();
        } else {
          this.errorMsg = response.message || 'Failed to update testimonial';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = 'Error updating testimonial: ' + (error.error?.message || error.message || 'Unknown error');
      }
    });
  }

  deleteTestimonial(testimonial: Testimonial) {
    if (!confirm(`Are you sure you want to delete this testimonial from ${testimonial.user.name}?`)) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.testimonialService.deleteTestimonial(testimonial._id).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMsg = 'Testimonial deleted successfully!';
          this.loadTestimonials();
        } else {
          this.errorMsg = response.message || 'Failed to delete testimonial';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = 'Error deleting testimonial: ' + (error.error?.message || error.message || 'Unknown error');
      }
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.selectedTestimonial = null;
    this.editForm = {
      message: '',
      isApproved: false
    };
    this.errorMsg = '';
    this.successMsg = '';
  }

  getStatusBadgeClass(isApproved: boolean): string {
    return isApproved ? 'badge bg-success' : 'badge bg-warning';
  }

  getStatusText(isApproved: boolean): string {
    return isApproved ? 'Approved' : 'Pending';
  }
}
