import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { WalletService } from '../../core/services/wallet.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { BookService } from '../../core/services/book.service';

@Component({
  selector: 'app-checkout',
  imports: [FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {

  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private walletService = inject(WalletService);
  private bookService = inject(BookService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  cart: any = null;
  walletBalance = 0;
  paymentMode = 'COD';
  loading = false;
  address = { street: '', city: '', state: '', zipCode: '', country: 'India' };
  userProfile: any = null;
  stockErrors: string[] = [];

  ngOnInit() {
    const userId = this.auth.getUserId()!;
    this.cartService.getCart(userId).subscribe({
      next: c => {
        this.cart = c;
        // Verify stock for each item in cart
        this.verifyCartStock();
      }
    });
    this.walletService.getBalance().subscribe({ next: b => this.walletBalance = b.balance, error: () => {} });
    this.auth.getProfile(userId).subscribe({ next: p => this.userProfile = p });
  }

  /** Check current stock for every item in the cart */
  verifyCartStock() {
    if (!this.cart?.items?.length) return;
    this.stockErrors = [];
    for (const item of this.cart.items) {
      this.bookService.getById(item.bookId).subscribe({
        next: (book: any) => {
          item._currentStock = book.stock;
          if (book.stock < item.quantity) {
            if (book.stock === 0) {
              this.stockErrors.push(`"${item.bookTitle}" is out of stock.`);
            } else {
              this.stockErrors.push(`"${item.bookTitle}" has only ${book.stock} in stock (you want ${item.quantity}).`);
            }
          }
        },
        error: () => {}
      });
    }
  }

  placeOrder() {
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
      this.toast.show('Your cart is empty', 'error');
      return;
    }

    // Check stock errors
    if (this.stockErrors.length > 0) {
      this.toast.show('Insufficient stock: ' + this.stockErrors[0], 'error');
      return;
    }

    // --- Address Validation ---
    if (!this.address.street || this.address.street.trim() === '') {
      this.toast.show('Please enter your street address', 'error');
      return;
    }
    if (!this.address.city || this.address.city.trim() === '') {
      this.toast.show('Please enter your city', 'error');
      return;
    }
    if (!this.address.state || this.address.state.trim() === '') {
      this.toast.show('Please enter your state', 'error');
      return;
    }
    if (!this.address.zipCode || this.address.zipCode.trim() === '') {
      this.toast.show('Please enter your PIN code', 'error');
      return;
    }

    this.loading = true;
    const userId = this.auth.getUserId()!;
    const firstItem = this.cart.items[0]; // Backend only supports one item per order

    const orderRequest = {
      userId,
      productId: firstItem.bookId,
      quantity: firstItem.quantity,
      modeOfPayment: this.paymentMode,
      fullName: this.userProfile?.fullName || 'Customer',
      mobileNumber: String(this.userProfile?.mobile || ''),
      flatNumber: this.address.street.trim(),
      city: this.address.city.trim(),
      pincode: this.address.zipCode.trim(),
      state: this.address.state.trim()
    };

    this.orderService.placeOrder(orderRequest).subscribe({
      next: (res: any) => {
        if (this.paymentMode === 'WALLET') {
          this.orderService.onlinePayment({ orderId: res.orderId }).subscribe({
            next: () => this.finalizeOrder(userId),
            error: err => {
              this.loading = false;
              this.toast.show(err.error?.message || err.error || 'Payment failed', 'error');
            }
          });
        } else {
          this.finalizeOrder(userId);
        }
      },
      error: err => {
        this.loading = false;
        const msg = err.error?.message || err.error || 'Order failed';
        this.toast.show(msg, 'error');
        // Re-verify stock since it may have changed
        this.verifyCartStock();
      }
    });
  }

  private finalizeOrder(userId: number) {
    this.cartService.clearCart(userId).subscribe();
    this.toast.show('Order placed successfully!', 'success');
    this.router.navigate(['/order-success']);
  }
}
