import { Component, computed, inject, input, signal } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { QuestionnaireStore } from '../../features/questionnaire/data-access/questionnaire.store';
import { Option, Question } from '../../shared/models/questionnaire.model';

@Component({
  selector: 'app-question-preview',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,

    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './question-preview.component.html',
  styleUrls: ['./question-preview.component.scss'],
})
export class QuestionPreviewComponent {
  readonly qs = inject(QuestionnaireStore);
  readonly questionId = input.required<string>();

  readonly question = computed<Question | null>(() => {
    const map = this.qs.questionsById();
    return map[this.questionId()] ?? null;
  });

  readonly opts = computed<Option[]>(() => this.qs.getOptionsForQuestion(this.questionId()));

  // ✅ preview-only state (ne ide u store)
  readonly selectedRadioId = signal<string>('');
  readonly selectedCheckboxIds = signal<Set<string>>(new Set());

  onToggleCheckbox(optionId: string): void {
    const next = new Set(this.selectedCheckboxIds());
    if (next.has(optionId)) next.delete(optionId);
    else next.add(optionId);
    this.selectedCheckboxIds.set(next);
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
