import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-book-detail',
  imports: [FormsModule, DatePipe],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css'
})
export class BookDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private reviewService = inject(ReviewService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  book: any = null;
  reviews: any[] = [];
  inWishlist = false;
  newReview = { rating: 0, comment: '' };
  bookImages: any[] = [];
  selectedImage = '';
  apiUrl = environment.apiUrl;
  quantity = 1;
  currentUserName = '';

  getRatingFill(star: number, rating: number): string {
    return star <= Math.round(rating || 0) ? "'FILL' 1" : "'FILL' 0";
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookService.getById(id).subscribe({
      next: b => {
        this.book = b;
        this.selectedImage = this.getImageUrl(b.coverImageUrl);
      }
    });
    this.reviewService.getByBook(id).subscribe({ next: (res: any) => this.reviews = res?.content || res || [] });
    if (this.auth.isLoggedIn()) {
      this.wishlistService.check(id).subscribe({ next: v => this.inWishlist = v, error: () => {} });
      // Fetch current user's name for reviews
      this.auth.getProfile().subscribe({
        next: (user: any) => this.currentUserName = user?.fullName || '',
        error: () => {}
      });
    }
    // Load additional images
    this.bookService.getImages(id).subscribe({
      next: (imgs: any[]) => this.bookImages = (imgs || []).filter(img => img && img.imageUrl),
      error: () => this.bookImages = []
    });
  }

  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return this.apiUrl + '/api/v1' + url;
  }

  selectImage(url: string) {
    this.selectedImage = this.getImageUrl(url);
  }

  changeQty(delta: number) {
    const newQty = this.quantity + delta;
    if (newQty < 1) return;
    if (this.book && newQty > this.book.stock) {
      this.toast.show(`Only ${this.book.stock} available in stock`, 'error');
      return;
    }
    this.quantity = newQty;
  }

  addToCart() {
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please login to add items to cart.', 'info');
      this.router.navigate(['/login']);
      return;
    }
    if (this.book.stock < 1) {
      this.toast.show('This book is out of stock', 'error');
      return;
    }
    if (this.quantity > this.book.stock) {
      this.toast.show(`Only ${this.book.stock} available in stock`, 'error');
      return;
    }
    const userId = this.auth.getUserId();
    if (!userId) return;
    this.cartService.addItem(userId, this.book.bookId, this.quantity).subscribe({
      next: () => this.toast.show(`Added ${this.quantity} to cart!`, 'success'),
      error: err => {
        const msg = err.error?.message || err.error || 'Failed to add to cart';
        this.toast.show(msg, 'error');
      }
    });
  }

  toggleWishlist() {
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please login to manage your wishlist.', 'info');
      this.router.navigate(['/login']);
      return;
    }
    if (this.inWishlist) {
      this.wishlistService.remove(this.book.bookId).subscribe({
        next: () => { this.inWishlist = false; this.toast.show('Removed from wishlist', 'info'); }
      });
    } else {
      this.wishlistService.add(this.book.bookId).subscribe({
        next: () => { this.inWishlist = true; this.toast.show('Added to wishlist!', 'success'); }
      });
    }
  }

  submitReview() {
    this.reviewService.addReview({
      bookId: this.book.bookId,
      userId: this.auth.getUserId(),
      userName: this.currentUserName,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    }).subscribe({
      next: (r: any) => {
        this.reviews.unshift(r);
        this.newReview = { rating: 0, comment: '' };
        this.toast.show('Review submitted!', 'success');
      },
      error: err => this.toast.show(err.error?.message || err.error || 'Failed', 'error')
    });
  }

  getInitial(name: string | undefined): string {
    if (!name || name.trim() === '') return '?';
    return name.trim().charAt(0).toUpperCase();
  }
}
