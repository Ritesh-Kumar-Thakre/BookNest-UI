import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  user: any = null;
  editUser = { fullName: '', mobile: null, userId: 0 };
  oldPass = '';
  newPass = '';
  uploadingImage = false;
  apiUrl = environment.apiUrl;

  ngOnInit() {
    const userId = this.auth.getUserId()!;
    this.auth.getProfile(userId).subscribe({
      next: (u: any) => { this.user = u; this.editUser = { fullName: u.fullName, mobile: u.mobile, userId: u.userId }; }
    });
  }

  getProfileImageUrl(): string {
    if (!this.user?.profileImageUrl) return '';
    const url = this.user.profileImageUrl;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    // The stored URL is like "/auth/uploads/filename.jpg"
    // The API gateway routes /api/v1/auth/** → auth-service /auth/**
    return this.apiUrl + '/api/v1' + url;
  }

  onProfileImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    // Show immediate preview using FileReader
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (this.user) {
        this.user.profileImageUrl = e.target.result;
      }
    };
    reader.readAsDataURL(file);

    this.uploadingImage = true;
    this.auth.uploadProfileImage(file).subscribe({
      next: (res: any) => {
        this.user.profileImageUrl = res.imageUrl;
        this.uploadingImage = false;
        this.toast.show('Profile image updated!', 'success');
      },
      error: () => {
        this.uploadingImage = false;
        this.toast.show('Failed to upload image', 'error');
      }
    });
  }

  update() {
    this.auth.updateProfile(this.editUser).subscribe({
      next: () => { this.user.fullName = this.editUser.fullName; this.user.mobile = this.editUser.mobile; this.toast.show('Profile updated!', 'success'); },
      error: err => this.toast.show(err.error?.message || err.error || 'Failed', 'error')
    });
  }

  changePass() {
    this.auth.changePassword(this.user.userId, this.oldPass, this.newPass).subscribe({
      next: () => { this.oldPass = ''; this.newPass = ''; this.toast.show('Password changed!', 'success'); },
      error: err => this.toast.show(err.error?.message || err.error || 'Failed', 'error')
    });
  }
}
