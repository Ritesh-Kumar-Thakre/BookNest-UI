import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { WalletService } from '../../core/services/wallet.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-wallet',
  imports: [FormsModule, DatePipe],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css'
})
export class Wallet implements OnInit {
  private walletService = inject(WalletService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  wallet: any = null;
  statements: any[] = [];
  amount: number | null = null;

  ngOnInit() {
    const userId = this.auth.getUserId()!;
    this.walletService.getUserWallet().subscribe({
      next: w => {
        this.wallet = w;
        this.loadStatements(w.walletId);
      },
      error: (err) => {
        if (err.status === 404 || err.error?.message?.includes('not found')) {
          this.walletService.addWallet({ userId: userId, currentBalance: 0 }).subscribe({
            next: (newWallet: any) => {
              this.wallet = newWallet;
              this.loadStatements(newWallet.walletId);
            },
            error: () => this.toast.show('Failed to create wallet', 'error')
          });
        } else {
          this.toast.show('Failed to fetch wallet', 'error');
        }
      }
    });
  }

  loadStatements(walletId: number) {
    this.walletService.getStatements(walletId).subscribe({ 
      next: s => this.statements = s, 
      error: () => this.statements = [] 
    });
  }

  addMoney() {
    if (!this.amount || this.amount < 1 || !this.wallet) return;
    this.walletService.addMoney(this.wallet.walletId, this.amount).subscribe({
      next: () => { 
        this.amount = null; 
        this.toast.show('Money added successfully!', 'success'); 
        this.ngOnInit(); // Reload wallet balance and statements
      },
      error: err => {
        const msg = err.error?.message || (typeof err.error === 'string' ? err.error : err.message) || 'Failed to add money';
        this.toast.show(msg, 'error');
      }
    });
  }
}
