import { Component, computed, inject, input } from '@angular/core';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {QuestionnaireStore} from '../../features/questionnaire/data-access/questionnaire.store';
import {Question} from '../../shared/models/questionnaire.model';
import {OptionQuestionEditorComponent} from '../option-question-editor/option-question-editor.component';
import { HostListener } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {MatIcon} from '@angular/material/icon';
import {QuestionPreviewComponent} from '../question-preview/question-preview.component';



@Component({
  selector: 'app-question-item',
  standalone: true,
  imports: [
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    DragDropModule,
    OptionQuestionEditorComponent,
    MatIcon,
    QuestionPreviewComponent,
  ],
  templateUrl: './question-item.component.html',
  styleUrls: ['./question-item.component.scss'],
})
export class QuestionItemComponent {
  readonly qs = inject(QuestionnaireStore);

  readonly questionId = input.required<string>();

  readonly activeQuestionId = this.qs.activeQuestionId;

  readonly isActive = computed(() => {
    const q = this.question();
    return !!q && this.activeQuestionId() === q.id;
  });

  readonly question = computed<Question | null>(() => {
    const map = this.qs.questionsById();
    return map[this.questionId()] ?? null;
  });

  onQuestionTextChange(questionId: string, value: string): void {
    this.qs.updateQuestionText(questionId, value);
  }

  isOptionType(type: string): boolean {
    return type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown';
  }

  setActive(qid: string): void {
    this.qs.setActiveQuestion(qid);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.isActive()) this.qs.clearActiveQuestion();
  }

}
