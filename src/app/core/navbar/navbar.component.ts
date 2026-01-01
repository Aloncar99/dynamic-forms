import { Component, computed } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ShellService } from '../layout/shell.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf, MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  readonly isMenuOpen = computed(() => this.shell.menuOpen());
  constructor(private shell: ShellService) {}

  toggleMenu(): void {
    this.shell.toggleMenu();
  }
}
