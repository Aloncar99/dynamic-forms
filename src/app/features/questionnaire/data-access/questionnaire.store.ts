import { Injectable } from '@angular/core';
import { createQuestionnaireState } from './questionnaire.state';

import { createSectionActions } from './questionnaire.sections.actions';
import { createQuestionActions } from './questionnaire.questions.actions';
import { createOptionsAndLogicActions } from './questionnaire.options-logic.actions';

@Injectable({ providedIn: 'root' })
export class QuestionnaireStore {
  private readonly s = createQuestionnaireState();

  // =========================
  // SELECTORS (public)
  // =========================
  readonly questionnaire = this.s.questionnaire;
  readonly sections = this.s.sections;
  readonly activeSectionId = this.s.activeSectionId;
  readonly activeQuestionId = this.s.activeQuestionId;
  readonly questionsById = this.s.questionsById;
  readonly optionsById = this.s.optionsById;
  readonly activeSection = this.s.activeSection;
  readonly state = this.s.state;

  // =========================
  // ACTIONS (composed)
  // =========================
  private readonly sectionActions = createSectionActions(this.s);
  private readonly questionActions = createQuestionActions(this.s);
  private readonly optionsLogicActions = createOptionsAndLogicActions(this.s);

  // Sections
  setActiveSection = this.sectionActions.setActiveSection;
  addSection = this.sectionActions.addSection;
  addSectionAfter = this.sectionActions.addSectionAfter;
// preostalo implementirati editovanje naziva sekcije
  updateSectionTitle = this.sectionActions.updateSectionTitle;

  // Questions
  setActiveQuestion = this.questionActions.setActiveQuestion;
  clearActiveQuestion = this.questionActions.clearActiveQuestion;
  addQuestion = this.questionActions.addQuestion;
  moveQuestionInSection = this.questionActions.moveQuestionInSection;
  getQuestionsForSection = this.questionActions.getQuestionsForSection;
  updateQuestionText = this.questionActions.updateQuestionText;

  // Options + Logic
  getOptionsForQuestion = this.optionsLogicActions.getOptionsForQuestion;
  addOption = this.optionsLogicActions.addOption;
  updateOptionText = this.optionsLogicActions.updateOptionText;
  toggleOptionRedFlag = this.optionsLogicActions.toggleOptionRedFlag;
  updateOptionComment = this.optionsLogicActions.updateOptionComment;
  updateOptionPoints = this.optionsLogicActions.updateOptionPoints;
  removeOption = this.optionsLogicActions.removeOption;

  addLogicRule = this.optionsLogicActions.addLogicRule;
  removeLogicRule = this.optionsLogicActions.removeLogicRule;
  updateLogicWhenOption = this.optionsLogicActions.updateLogicWhenOption;
  updateLogicJumpKind = this.optionsLogicActions.updateLogicJumpKind;
  updateLogicTarget = this.optionsLogicActions.updateLogicTarget;
  moveQuestionWithinSection(sectionId: string, fromIndex: number, toIndex: number): void {
    this.moveQuestionInSection(sectionId, fromIndex, toIndex);
  }
}
