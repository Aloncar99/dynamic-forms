import { Component, computed, inject, signal } from '@angular/core';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { QuestionnaireStore } from '../../data-access/questionnaire.store';
import { Option, Question } from '../../../../shared/models/questionnaire.model';

type AnswerValue =
  | { kind: 'text'; value: string }
  | { kind: 'date'; value: string }
  | { kind: 'single'; optionId: string }
  | { kind: 'multi'; optionIds: string[] };

@Component({
  selector: 'app-questionnaire-fill',
  standalone: true,
  imports: [
    NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault,
    MatButtonModule, MatCheckboxModule, MatRadioModule, MatIconModule, MatInputModule,
  ],
  templateUrl: './questionnaire-fill.component.html',
  styleUrls: ['./questionnaire-fill.component.scss'],
})
export class QuestionnaireFillComponent {
  readonly qs = inject(QuestionnaireStore);

  // 1) finalna lista pitanja (flatten po sekcijama)
  readonly questionIds = computed<string[]>(() => {
    const secs = this.qs.sections();
    const map = this.qs.questionsById();
    const out: string[] = [];

    for (const s of secs) {
      for (const qid of s.questionIds ?? []) {
        if (map[qid]) out.push(qid);
      }
    }
    return out;
  });

  // 2) index / current question
  readonly index = signal(0);

  readonly currentQuestion = computed<Question | null>(() => {
    const ids = this.questionIds();
    const map = this.qs.questionsById();
    return map[ids[this.index()]] ?? null;
  });

  readonly currentOptions = computed<Option[]>(() => {
    const q = this.currentQuestion();
    if (!q) return [];
    return this.qs.getOptionsForQuestion(q.id);
  });

  // 3) answers (lokalno)
  readonly answers = signal<Record<string, AnswerValue>>({});

  // ✅ NEW: history stack (ID-evi posjecenih pitanja)
  readonly history = signal<string[]>([]);

  // helpers
  isFirst = computed(() => this.history().length === 0);
  isLast = computed(() => this.index() >= this.questionIds().length - 1);

  canGoNext = computed(() => {
    const q = this.currentQuestion();
    if (!q) return false;

    const a = this.answers()[q.id];
    if (!a) return false;

    if (q.type === 'short_text' || q.type === 'long_text') return a.kind === 'text';
    if (q.type === 'date') return a.kind === 'date';
    if (q.type === 'multiple_choice' || q.type === 'dropdown') return a.kind === 'single' && !!a.optionId;
    if (q.type === 'checkboxes') return a.kind === 'multi' && a.optionIds.length > 0;

    return true;
  });

  // ✅ Prev ide preko history stacka (ne index-1)
  prev(): void {
    const stack = this.history();
    if (stack.length === 0) return;

    const prevId = stack[stack.length - 1];
    const nextStack = stack.slice(0, -1);

    const ids = this.questionIds();
    const prevIndex = ids.indexOf(prevId);

    this.history.set(nextStack);

    if (prevIndex >= 0) {
      this.index.set(prevIndex);
    } else {
      // fallback ako je pitanje obrisano / nije vise u listi
      this.index.set(Math.max(0, this.index() - 1));
    }
  }

  // answer setters (ostaju isti)
  setText(value: string): void {
    const q = this.currentQuestion();
    if (!q) return;

    this.answers.update((m: Record<string, AnswerValue>) => ({
      ...m,
      [q.id]: { kind: 'text', value } as AnswerValue,
    }));
  }

  setDate(value: string): void {
    const q = this.currentQuestion();
    if (!q) return;

    this.answers.update((m: Record<string, AnswerValue>) => ({
      ...m,
      [q.id]: { kind: 'date', value } as AnswerValue,
    }));
  }

  setSingle(optionId: string): void {
    const q = this.currentQuestion();
    if (!q) return;

    this.answers.update((m: Record<string, AnswerValue>) => ({
      ...m,
      [q.id]: { kind: 'single', optionId } as AnswerValue,
    }));
  }

  toggleMulti(optionId: string, checked: boolean): void {
    const q = this.currentQuestion();
    if (!q) return;

    const cur = this.answers()[q.id];
    const existing = cur?.kind === 'multi' ? cur.optionIds : [];
    const next = checked
      ? Array.from(new Set([...existing, optionId]))
      : existing.filter((id) => id !== optionId);

    this.answers.update((m: Record<string, AnswerValue>) => ({
      ...m,
      [q.id]: { kind: 'multi', optionIds: next } as AnswerValue,
    }));
  }


  private answerForCurrent(): AnswerValue | null {
    const q = this.currentQuestion();
    if (!q) return null;
    return this.answers()[q.id] ?? null;
  }

  singleOptionId(): string {
    const a = this.answerForCurrent();
    return a?.kind === 'single' ? a.optionId : '';
  }

  textValue(): string {
    const a = this.answerForCurrent();
    return a?.kind === 'text' ? a.value : '';
  }

  dateValue(): string {
    const a = this.answerForCurrent();
    return a?.kind === 'date' ? a.value : '';
  }

  /**
   * Conditional logic -> vraca index skoka ili null.
   */
  private findJumpTarget(question: Question, answer: AnswerValue): number | null {
    if (!question.logic || question.logic.length === 0) return null;
    if (answer.kind !== 'single') return null;

    const matchingRule = question.logic.find((rule) => rule.whenOptionId === answer.optionId);
    if (!matchingRule || !matchingRule.jumpTo.targetId) return null;

    const targetId = matchingRule.jumpTo.targetId;
    const questionIds = this.questionIds();

    if (matchingRule.jumpTo.kind === 'question') {
      const targetIndex = questionIds.indexOf(targetId);
      return targetIndex >= 0 ? targetIndex : null;
    }

    const sections = this.qs.sections();
    const targetSection = sections.find((s) => s.id === targetId);
    if (!targetSection || targetSection.questionIds.length === 0) return null;

    const firstQuestionId = targetSection.questionIds[0];
    const targetIndex = questionIds.indexOf(firstQuestionId);
    return targetIndex >= 0 ? targetIndex : null;
  }

  // ✅ Next: push current u history, pa idi na jump ili default
  next(): void {
    const q = this.currentQuestion();
    if (!q) return;
    if (this.isLast()) return;

    const answer = this.answers()[q.id];
    const currentIndex = this.index();

    let nextIndex: number | null = null;

    if (answer) {
      nextIndex = this.findJumpTarget(q, answer);
      if (nextIndex === currentIndex) nextIndex = null; // anti-loop
    }

    if (nextIndex === null) {
      nextIndex = currentIndex + 1;
    }

    // push history (prije navigacije)
    this.history.update((h) => [...h, q.id]);

    this.index.set(nextIndex);
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  isChecked(optionId: string): boolean {
    const q = this.currentQuestion();
    if (!q) return false;

    const a = this.answers()[q.id];
    return a?.kind === 'multi' ? a.optionIds.includes(optionId) : false;
  }
}
