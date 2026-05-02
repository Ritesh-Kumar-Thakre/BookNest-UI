import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book.service';

@Component({
  selector: 'app-search',
  imports: [RouterLink, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search implements OnInit {
  private bookService = inject(BookService);
  private route = inject(ActivatedRoute);
  query = '';
  results: any[] = [];
  searched = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.query = params['q'];
        this.search();
      }
    });
  }

  search() {
    if (!this.query.trim()) return;
    this.searched = true;
    this.bookService.search('keyword', this.query).subscribe({
      next: books => this.results = books,
      error: () => this.results = []
    });
  }
}
