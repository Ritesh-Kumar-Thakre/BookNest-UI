import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-orders',
  imports: [DatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  private orderService = inject(OrderService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  orders: any[] = [];

  ngOnInit() {
    const userId = this.auth.getUserId()!;
    this.orderService.getByUser(userId).subscribe({
      next: o => this.orders = (o || []).sort((a: any, b: any) => b.orderId - a.orderId),
      error: () => this.orders = []
    });
  }

  cancel(order: any) {
    this.orderService.cancelOrder(order.orderId).subscribe({
      next: () => { order.orderStatus = 'CANCELLED'; this.toast.show('Order cancelled', 'info'); },
      error: err => this.toast.show(err.error?.message || err.error || 'Failed', 'error')
    });
  }
}
