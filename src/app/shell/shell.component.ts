import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Spelling', icon: 'spellcheck', route: '/spelling' },
    { label: 'Reading', icon: 'menu_book', route: '/reading' },
    { label: 'Math', icon: 'calculate', route: '/math' },
    { label: 'States', icon: 'public', route: '/states' },
    { label: 'Science', icon: 'science', route: '/science' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];
  readonly isSidenavOpen = signal(true);

  toggleSidenav() {
    this.isSidenavOpen.update(open => !open);
  }
}
