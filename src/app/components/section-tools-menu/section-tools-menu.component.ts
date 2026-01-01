import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QuestionType } from '../../shared/models/questionnaire.model';

@Component({
  selector: 'app-section-tools-menu',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './section-tools-menu.component.html',
  styleUrls: ['./section-tools-menu.component.scss'],
})
export class SectionToolsMenuComponent {
  @Input({ required: true }) sectionId!: string;

  // parent kontrolise store
  @Output() activateSection = new EventEmitter<string>();
  @Output() addSectionAfter = new EventEmitter<string>();
  @Output() addQuestion = new EventEmitter<{ sectionId: string; type: QuestionType }>();

  // local menu state
  addMenuOpen = false;
  addMenuPos = { x: 0, y: 0 };

  private readonly MENU_W = 186;     // mora match CSS width
  private readonly GAP = 10;         // razmak od dugmeta
  private readonly EDGE = 8;         // minimalni razmak od ivica ekrana
  private readonly MENU_H_EST = 320; // procjena visine (ok za clamp)

  toggleAddMenu(ev: MouseEvent): void {
    ev.stopPropagation();

    // aktiviraj sekciju u parentu (da se panel smatra "active")
    this.activateSection.emit(this.sectionId);

    // toggle
    if (this.addMenuOpen) {
      this.closeAddMenu();
      return;
    }

    this.addMenuOpen = true;

    const btn = ev.currentTarget as HTMLElement;
    const r = btn.getBoundingClientRect();

    // lijevo od plusa
    const OFFSET_X = 10; // tu stelujes 2-3px po potrebi
    let x = r.left - this.MENU_W - this.GAP - OFFSET_X;

    // fallback desno
    if (x < this.EDGE) x = r.right + this.GAP;

    // y uz dugme
    let y = r.top - 6;

    // clamp
    const maxY = window.innerHeight - this.MENU_H_EST - this.EDGE;
    y = Math.max(this.EDGE, Math.min(y, maxY));

    const maxX = window.innerWidth - this.MENU_W - this.EDGE;
    x = Math.max(this.EDGE, Math.min(x, maxX));

    this.addMenuPos = { x, y };
  }

  onAddSection(): void {
    this.addSectionAfter.emit(this.sectionId);
    this.closeAddMenu();
  }

  onAddQuestion(type: QuestionType): void {
    this.addQuestion.emit({ sectionId: this.sectionId, type });
    this.closeAddMenu();
  }

  closeAddMenu(): void {
    this.addMenuOpen = false;
  }

  // ESC zatvara
  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.addMenuOpen) this.closeAddMenu();
  }

  // scroll/resize zatvori (najmanje bugova)
  @HostListener('window:scroll')
  onScroll(): void {
    if (this.addMenuOpen) this.closeAddMenu();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.addMenuOpen) this.closeAddMenu();
  }

  // klik vani zatvara
  @HostListener('document:click')
  onDocClick(): void {
    if (this.addMenuOpen) this.closeAddMenu();
  }
}
