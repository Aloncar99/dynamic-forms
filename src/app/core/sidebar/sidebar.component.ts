import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export type NavItem = { label: string; icon: string; link: string };
export type UserInfo = { initials: string; name: string; role: string };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Input({ required: true }) user!: UserInfo;
  @Input({ required: true }) navItems!: NavItem[];
}
