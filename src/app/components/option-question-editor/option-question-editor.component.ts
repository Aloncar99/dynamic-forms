import { Component, computed, inject, input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {QuestionnaireStore} from '../../features/questionnaire/data-access/questionnaire.store';
import {JumpTarget, Option, Question, Section} from '../../shared/models/questionnaire.model';

type TargetItem = { id: string; label: string };

@Component({
  selector: 'app-option-question-editor',
  standalone: true,
  imports: [
    NgIf,
    NgFor,

    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './option-question-editor.component.html',
  styleUrls: ['./option-question-editor.component.scss'],
})
export class OptionQuestionEditorComponent {
  readonly qs = inject(QuestionnaireStore);

  readonly questionId = input.required<string>();

  readonly question = computed<Question | null>(() => {
    const map = this.qs.questionsById();
    return map[this.questionId()] ?? null;
  });

  readonly opts = computed<Option[]>(() => this.qs.getOptionsForQuestion(this.questionId()));

  // options
  addOption(): void {
    this.qs.addOption(this.questionId());
  }

  onOptionTextChange(optionId: string, value: string): void {
    this.qs.updateOptionText(optionId, value);
  }

  onOptionRedFlagChange(optionId: string, checked: boolean): void {
    this.qs.toggleOptionRedFlag(optionId, checked);
  }

  onOptionCommentChange(optionId: string, value: string): void {
    this.qs.updateOptionComment(optionId, value);
  }

  onOptionPointsChange(optionId: string, value: string): void {
    this.qs.updateOptionPoints(optionId, value);
  }

  removeOption(optionId: string): void {
    this.qs.removeOption(this.questionId(), optionId);
  }

  // logic rules
  addLogicRule(): void {
    this.qs.addLogicRule(this.questionId());
  }

  removeLogicRule(index: number): void {
    this.qs.removeLogicRule(this.questionId(), index);
  }

  onLogicWhenOptionChange(index: number, optionId: string): void {
    this.qs.updateLogicWhenOption(this.questionId(), index, optionId);
  }

  onLogicJumpKindChange(index: number, kind: JumpTarget['kind']): void {
    this.qs.updateLogicJumpKind(this.questionId(), index, kind);
  }

  onLogicTargetChange(index: number, targetId: string): void {
    this.qs.updateLogicTarget(this.questionId(), index, targetId);
  }

  // targets
  allSectionsForJump(): TargetItem[] {
    return this.qs.sections().map((s: Section) => ({
      id: s.id,
      label: `${s.code} — ${s.title}`,
    }));
  }

  allQuestionsForJump(): TargetItem[] {
    const secs = this.qs.sections();
    const map = this.qs.questionsById();

    const out: TargetItem[] = [];
    for (const s of secs) {
      for (const qid of s.questionIds) {
        const q = map[qid];
        if (!q) continue;
        out.push({ id: q.id, label: `${q.code} — ${q.text || '(bez teksta)'}` });
      }
    }
    return out;
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
