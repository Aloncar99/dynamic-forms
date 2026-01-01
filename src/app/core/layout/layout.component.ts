import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent, NavItem } from '../sidebar/sidebar.component';
import { ShellService } from './shell.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  constructor(public shell: ShellService) {}

  user = { initials: 'IP', name: 'Marko Marković', role: 'Superadmin' };

  navItems: NavItem[] = [
    { label: 'Prijave', icon: 'chat', link: '/questionnaire/run' },
    { label: 'Projekti', icon: 'holiday_village', link: '/questionnaire/builder' },
    { label: 'Analitika i detekcija', icon: 'bar_chart', link: '/analytics' },
    { label: 'Izvještavanje', icon: 'assignment', link: '/reports' },
    { label: 'Administracija korisnika', icon: 'groups', link: '/users' },
    { label: 'Postavke', icon: 'settings', link: '/settings' },
  ];
}
