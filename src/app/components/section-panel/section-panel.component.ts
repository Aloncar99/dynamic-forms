import { Component, computed, inject, input } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

import { QuestionItemComponent } from '../question-item/question-item.component';
import { SectionToolsMenuComponent } from '../section-tools-menu/section-tools-menu.component';

import { QuestionnaireStore } from '../../features/questionnaire/data-access/questionnaire.store';
import { QuestionType, Section } from '../../shared/models/questionnaire.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-section-panel',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    MatExpansionModule,
    QuestionItemComponent,
    SectionToolsMenuComponent,
    DragDropModule,
  ],
  templateUrl: './section-panel.component.html',
  styleUrls: ['./section-panel.component.scss'],
})
export class SectionPanelComponent {
  readonly qs = inject(QuestionnaireStore);

  readonly sectionId = input.required<string>();
  readonly activeSectionId = this.qs.activeSectionId;
  readonly sections = this.qs.sections;

  readonly section = computed<Section | null>(() => {
    const id = this.sectionId();
    return this.sections().find((x) => x.id === id) ?? null;
  });

  setActiveSection(id: string): void {
    this.qs.setActiveSection(id);
  }

  addSectionFromMenu(fromSectionId: string): void {
    this.qs.addSectionAfter(fromSectionId);
  }

  addQuestionToSection(sectionId: string, type: QuestionType): void {
    this.qs.addQuestion(type, sectionId);
  }

  trackByString(_: number, id: string): string {
    return id;
  }

  onQuestionsDropped(sectionId: string, ev: CdkDragDrop<string[]>): void {
    if (ev.previousIndex === ev.currentIndex) return;

    // opcija A (preporuka): sve kroz store
    this.qs.moveQuestionWithinSection(sectionId, ev.previousIndex, ev.currentIndex);

    // opcija B (ako hoces direktno): moveItemInArray(ev.container.data, ev.previousIndex, ev.currentIndex);
  }
}
