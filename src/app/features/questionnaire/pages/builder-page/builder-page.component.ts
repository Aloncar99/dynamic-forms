import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

import { QuestionnaireStore } from '../../data-access/questionnaire.store';
import {SectionPanelComponent} from '../../../../components/section-panel/section-panel.component';
import {Router} from '@angular/router';
import {DebugPanelComponent} from './debug-panel';

@Component({
  selector: 'app-builder-page',
  standalone: true,
  imports: [
    NgFor,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    SectionPanelComponent,
    DebugPanelComponent,
  ],
  templateUrl: './builder-page.component.html',
  styleUrls: ['./builder-page.component.scss'],
})
export class BuilderPageComponent {
  readonly qs = inject(QuestionnaireStore);
  readonly router = inject(Router);
  readonly sections = this.qs.sections;

  onPlay(): void {
    this.router.navigateByUrl('/questionnaire/fill');
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
  // debugEnabled = new URLSearchParams(location.search).get('debug') === '1';
  debugEnabled = '1' === '1';

}
