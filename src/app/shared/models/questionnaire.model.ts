export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'date'
  | 'document';

export interface Questionnaire {
  id: string;
  title: string;
  sections: Section[];
}

export interface Section {
  id: string;
  code: string;          // S-001
  title: string;
  questionIds: string[];
}

export interface Question {
  id: string;
  sectionId: string;
  code: string;          // Q-001
  type: QuestionType;
  text: string;
  optionIds: string[];
  logic: LogicRule[];
}

export interface Option {
  id: string;
  questionId: string;
  text: string;
  redFlag: boolean;
  comment: string;
  points: number | null;
}

export interface LogicRule {
  whenOptionId: string;
  jumpTo: JumpTarget;
}

export type JumpTarget =
  | { kind: 'question'; targetId: string }
  | { kind: 'section'; targetId: string };
