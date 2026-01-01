import { Component, Input, computed } from '@angular/core';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import {QuestionnaireStore} from '../../data-access/questionnaire.store';
import {Question,   Option as QuestionOption} from '../../../../shared/models/questionnaire.model';

@Component({
  selector: 'app-debug-panel',
  standalone: true,
  imports: [NgIf, NgFor, JsonPipe],
  template: `
    <div class="debug" *ngIf="enabled">
      <div class="debug-header">
        <b>DEBUG STATE</b>
        <span>activeSection: {{ qs.activeSectionId() }}</span>
        <span>activeQuestion: {{ qs.activeQuestionId() }}</span>
      </div>

      <!-- JSON -->
      <details open>
        <summary><b>Raw state (JSON)</b></summary>
        <pre>{{ qs.state() | json }}</pre>
      </details>

      <!-- RELATIONAL VIEW -->
      <details open class="mt">
        <summary><b>Relational view</b> (sections → questions → options / logic)</summary>

        <div class="table-wrap">
          <table class="dbg-table">
            <thead>
            <tr>
              <th>Section</th>
              <th>Question</th>
              <th>Type</th>
              <th>Options</th>
              <th>Logic rules</th>
            </tr>
            </thead>

            <tbody>
            <ng-container *ngFor="let row of rows()">
              <tr [class.is-active]="row.questionId === qs.activeQuestionId()">
                <td>
                  <div class="mono">{{ row.sectionCode }}</div>
                  <div class="muted">{{ row.sectionTitle }}</div>
                  <div class="muted mono">({{ row.sectionId }})</div>
                </td>

                <td>
                  <div class="mono">{{ row.questionCode }}</div>
                  <div>{{ row.questionText }}</div>
                  <div class="muted mono">({{ row.questionId }})</div>
                </td>

                <td class="mono">{{ row.questionType }}</td>

                <td>
                  <div *ngIf="row.options.length; else noOpts">
                    <div class="pill"
                         *ngFor="let o of row.options">
                      <span class="mono">{{ o.id.slice(0, 8) }}</span>
                      — {{ o.text }}
                      <span class="tag" [class.bad]="o.redFlag">RF: {{ o.redFlag }}</span>
                      <span class="tag">pts: {{ o.points ?? 'null' }}</span>
                    </div>
                  </div>
                  <ng-template #noOpts>
                    <span class="muted">—</span>
                  </ng-template>
                </td>

                <td>
                  <div *ngIf="row.logic.length; else noLogic">
                    <div class="pill" *ngFor="let r of row.logic">
                      IF <span class="mono">{{ r.whenOptionId.slice(0, 8) }}</span>
                      → {{ r.jumpTo.kind }}:
                      <span class="mono">{{ r.jumpTo.targetId.slice(0, 8) }}</span>
                    </div>
                  </div>
                  <ng-template #noLogic>
                    <span class="muted">—</span>
                  </ng-template>
                </td>
              </tr>
            </ng-container>
            </tbody>
          </table>
        </div>
      </details>
    </div>
  `,
  styles: [`
    .debug{
      position: fixed;
      right: 12px;
      bottom: 12px;
      width: 720px;
      max-height: 70vh;
      overflow: auto;
      background: rgba(0,0,0,.90);
      color:#fff;
      padding: 10px;
      border-radius: 10px;
      font-size: 11px;
      z-index: 9999;
    }
    .debug-header{
      display:flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 8px;
      opacity: .9;
    }
    details{ border: 1px solid rgba(255,255,255,.12); border-radius: 8px; padding: 8px; }
    summary{ cursor: pointer; }
    .mt{ margin-top: 10px; }
    pre{ margin:8px 0 0; white-space: pre-wrap; }
    .table-wrap{ margin-top: 8px; overflow:auto; }
    .dbg-table{ width: 100%; border-collapse: collapse; min-width: 980px; }
    .dbg-table th, .dbg-table td{ border: 1px solid rgba(255,255,255,.12); padding: 6px; vertical-align: top; }
    .dbg-table th{ background: rgba(255,255,255,.06); text-align: left; }
    .mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .muted{ opacity: .75; }
    .pill{ padding: 3px 6px; border: 1px solid rgba(255,255,255,.18); border-radius: 999px; display:inline-block; margin: 2px 4px 2px 0; }
    .tag{ margin-left: 6px; padding: 1px 6px; border-radius: 999px; border: 1px solid rgba(255,255,255,.18); }
    .tag.bad{ border-color: rgba(255,90,90,.6); }
    tr.is-active td{ outline: 1px solid rgba(120,200,255,.55); }
  `]
})
export class DebugPanelComponent {
  @Input() enabled = false;

  constructor(public qs: QuestionnaireStore) {}

  rows = computed(() => {
    const state = this.qs.state();
    const sections = state.questionnaire.sections;
    const qMap = state.questions;
    const oMap = state.options;

    const out: Array<{
      sectionId: string;
      sectionCode: string;
      sectionTitle: string;
      questionId: string;
      questionCode: string;
      questionText: string;
      questionType: string;
      options: QuestionOption[];
      logic: Question['logic'];
    }> = [];

    for (const sec of sections) {
      const ids = sec.questionIds ?? [];
      for (const qid of ids) {
        const q = qMap[qid];
        if (!q) continue;

        const options = (q.optionIds ?? [])
          .map((oid) => oMap[oid])
          .filter((x): x is QuestionOption => !!x);

        out.push({
          sectionId: sec.id,
          sectionCode: sec.code,
          sectionTitle: sec.title,
          questionId: q.id,
          questionCode: q.code,
          questionText: q.text,
          questionType: q.type,
          options,
          logic: q.logic ?? [],
        });
      }
    }

    return out;
  });
}
