import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { SpellingListsComponent } from './components/spelling-lists.component';
import { SpellingTestComponent } from './components/spelling-test.component';
import { SpellingPracticeComponent } from './components/spelling-practice/spelling-practice.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-spelling',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    SpellingListsComponent,
    SpellingPracticeComponent,
    SpellingTestComponent,
  ],
  templateUrl: './spelling.component.html',
  styleUrls: ['./spelling.component.scss'],
})
export class SpellingComponent implements OnInit {
  selectedTab = signal(0);

  constructor(private router: Router) {

    // Subscribe to router events to update the tab on navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.setTabOnLoad(url);
      });
  }
  ngOnInit(): void {
    this.setTabOnLoad();
  }

  setTabOnLoad(url?: string) {
      url = url ?? this.router.url;
      if (url.includes('/spelling/practice')) {
        this.selectedTab.set(1);
      } else if (url.includes('/spelling/test')) {
        this.selectedTab.set(2);
      } else {
        this.selectedTab.set(0);
      }
    }
}
