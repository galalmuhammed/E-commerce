import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactApiService, Contact, ContactResponse } from '../../../core/services/contact_service/contact-api.service';

@Component({
  selector: 'app-contact-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-management.html',
  styleUrl: './contact-management.css'
})
export class ContactManagementComponent implements OnInit {
  contacts: Contact[] = [];
  selectedContact: Contact | null = null;
  isViewing: boolean = false;
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private contactService: ContactApiService) {}

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    
    this.contactService.getAllContacts().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.contacts) {
          this.contacts = response.contacts;
        } else {
          this.errorMsg = response.message || 'Failed to load contact messages';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = 'Error loading contact messages: ' + (error.error?.message || error.message || 'Unknown error');
      }
    });
  }

  viewContact(contact: Contact) {
    this.selectedContact = contact;
    this.isViewing = true;
    this.errorMsg = '';
    this.successMsg = '';
    
    // Mark as read if not already read
    if (!contact.isRead) {
      this.markAsRead(contact);
    }
  }

  markAsRead(contact: Contact) {
    this.contactService.markAsRead(contact._id).subscribe({
      next: (response) => {
        if (response.success) {
          contact.isRead = true;
        }
      },
      error: (error) => {
        // Handle error silently
      }
    });
  }

  deleteContact(contact: Contact) {
    if (!confirm(`Are you sure you want to delete this message from ${contact.name}?`)) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.contactService.deleteContact(contact._id).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMsg = 'Contact message deleted successfully!';
          this.loadContacts();
          this.cancelView();
        } else {
          this.errorMsg = response.message || 'Failed to delete contact message';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = 'Error deleting contact message: ' + (error.error?.message || error.message || 'Unknown error');
      }
    });
  }

  cancelView() {
    this.isViewing = false;
    this.selectedContact = null;
    this.errorMsg = '';
    this.successMsg = '';
  }

  getStatusBadgeClass(isRead: boolean): string {
    return isRead ? 'badge bg-success' : 'badge bg-warning';
  }

  getStatusText(isRead: boolean): string {
    return isRead ? 'Read' : 'Unread';
  }

  getUnreadCount(): number {
    return this.contacts.filter(contact => !contact.isRead).length;
  }
}