import { Component, HostListener, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  totalItems: number = 0;
  currentPage: number = 1;
  userDetails: any;
  userRepos: any[] = [];
  userName: string = '';
  itemsPerPage: number = 10;
  totalPages: number = 0;
  selectedPage: number = 1;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchUserDetails(this.userName);
  }

  fetchUserDetails(name: string) {
    this.apiService.getUser(this.userName).subscribe((data: any) => {
      this.userDetails = data;
      this.totalItems = data.public_repos;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.fetchUserRepos(data.repos_url, this.currentPage, this.itemsPerPage);
    });
  }

  fetchUserRepos(reposUrl: string, page: number, itemsPerPage: number) {
    const startIndex = (page - 1) * itemsPerPage;
    const apiUrl = `${reposUrl}?page=${page}&per_page=${itemsPerPage}`;
    this.apiService.getRepos(apiUrl).subscribe((repos: any[]) => {
      this.userRepos = repos;
    });
  }

  handlePageChange(action: string | number) {
    if (action === 'prev' && this.currentPage > 1) {
      this.selectedPage--;
      this.currentPage--;
      this.fetchUserRepos(this.userDetails.repos_url, this.currentPage, this.itemsPerPage);
    } else if (action === 'next' && this.currentPage < this.totalPages) {
      this.selectedPage++;
      this.currentPage++;
      this.fetchUserRepos(this.userDetails.repos_url, this.currentPage, this.itemsPerPage);
    } else if (typeof action === 'number' && action >= 1 && action <= this.totalPages) {
      this.selectedPage = action;
      this.currentPage = action;
      this.fetchUserRepos(this.userDetails.repos_url, this.currentPage, this.itemsPerPage);
    }
  }

  calculateTotalPages(totalItems: number, itemsPerPage: number): number[] {
    this.totalPages = Math.ceil(totalItems / itemsPerPage);
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  updateUserName() {
    this.currentPage = 1;
    this.selectedPage = 1;
    this.fetchUserDetails(this.userName);
  }

  @HostListener('window:keydown', ['$event'])
  listenForEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.updateUserName();
    }
  }
}
