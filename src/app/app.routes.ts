import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'questionnaire', pathMatch: 'full' },

      // domain routes
      { path: 'questionnaire', redirectTo: 'questionnaire/run', pathMatch: 'full' },
      {
        path: 'questionnaire/builder',
        loadComponent: () =>
          import('./features/questionnaire/pages/builder-page/builder-page.component')
            .then(m => m.BuilderPageComponent),
      },
      {
        path: 'questionnaire/fill',
        loadComponent: () =>
          import('./features/questionnaire/pages/questionnaire-fill/questionnaire-fill.component')
            .then(m => m.QuestionnaireFillComponent),
      }
    ],
  },
  { path: '**', redirectTo: 'questionnaire/run' },
];
