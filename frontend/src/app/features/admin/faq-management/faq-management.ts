import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaqApiService, FAQ } from '../../../core/services/faq_service/faq-api.service';

@Component({
  selector: 'app-faq-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './faq-management.html',
  styleUrl: './faq-management.css'
})
export class FaqManagementComponent implements OnInit {
  faqs: FAQ[] = [];
  selectedFaq: FAQ | null = null;
  isEditing: boolean = false;
  loading = false;
  errorMsg = '';
  successMsg = '';
  editForm = {
    question: '',
    answer: '',
    isApproved: false
  };

  constructor(private faqService: FaqApiService) {}

  ngOnInit() {
    this.loadFAQs();
  }

  loadFAQs() {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    
    this.faqService.getAllFAQs().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.faqs) {
          this.faqs = response.faqs;
        } else {
          this.errorMsg = response.message || 'Failed to load FAQs';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = 'Error loading FAQs: ' + (error.error?.message || error.message || 'Unknown error');
      }
    });
  }

  editFaq(faq: FAQ) {
    this.selectedFaq = faq;
    this.editForm = {
      question: faq.question,
      answer: faq.answer,
      isApproved: faq.isApproved
    };
    this.isEditing = true;
    this.errorMsg = '';
    this.successMsg = '';
  }

  saveFaq() {
    if (!this.selectedFaq) return;

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.faqService.updateFAQ(this.selectedFaq._id, this.editForm).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMsg = 'FAQ updated successfully!';
          this.loadFAQs();
          this.cancelEdit();
        } else {
          this.errorMsg = response.message || 'Failed to update FAQ';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = 'Error updating FAQ: ' + (error.error?.message || error.message || 'Unknown error');
      }
    });
  }

  deleteFaq(faq: FAQ) {
    if (!confirm(`Are you sure you want to delete this FAQ from ${faq.askedBy.name}?`)) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.faqService.deleteFAQ(faq._id).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMsg = 'FAQ deleted successfully!';
          this.loadFAQs();
        } else {
          this.errorMsg = response.message || 'Failed to delete FAQ';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = 'Error deleting FAQ: ' + (error.error?.message || error.message || 'Unknown error');
      }
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.selectedFaq = null;
    this.editForm = {
      question: '',
      answer: '',
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

  hasAnswer(answer: string | boolean): boolean {
    return typeof answer === 'string' && answer.trim().length > 0;
  }
}
