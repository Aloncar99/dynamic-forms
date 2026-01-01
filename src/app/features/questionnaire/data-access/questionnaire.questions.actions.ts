import { moveItemInArray } from '@angular/cdk/drag-drop';
import type {QuestionnaireState, QuestionsMap} from './questionnaire.state';
import type { Question, Questionnaire, QuestionType } from '../../../shared/models/questionnaire.model';
import { uid, nextCode } from './questionnaire.utils';

/**
 * Questions actions => sve sto mijenja pitanja:
 * - set/clear aktivno pitanje
 * - add question
 * - reorder pitanja u sekciji
 * - update text
 * - helpers (read)
 */
export function createQuestionActions(s: QuestionnaireState) {
  /** Postavi aktivno pitanje globalno (za edit mode u UI-u). */
  const setActiveQuestion = (questionId: string | null): void => {
    s._activeQuestionId.set(questionId);
  };

  /** Ocisti aktivno pitanje. */
  const clearActiveQuestion = (): void => {
    s._activeQuestionId.set(null);
  };

  /** Dodaj pitanje u sekciju (default aktivna sekcija). */
  const addQuestion = (type: QuestionType, sectionId?: string): void => {
    const sid = sectionId ?? s._activeSectionId();
    if (!sid) return;

    const allQuestionCodes = Object.values(s._questions()).map((x) => x.code);
    const newQId = uid('q');

    const newQuestion: Question = {
      id: newQId,
      sectionId: sid,
      code: nextCode('Q', allQuestionCodes),
      type,
      text: 'Question',
      optionIds: [],
      logic: [],
    };

    // 1) upisi pitanje
    s._questions.update((map) => ({ ...map, [newQId]: newQuestion }));

    // 2) linkaj u sekciju (redoslijed)
    s._q.update((q: Questionnaire): Questionnaire => ({
      ...q,
      sections: q.sections.map((sec) =>
        sec.id === sid ? { ...sec, questionIds: [...sec.questionIds, newQId] } : sec
      ),
    }));

    // 3) odmah otvori u edit modu
    s._activeQuestionId.set(newQId);
  };

  /** Reorder pitanja unutar jedne sekcije (drag&drop). */
  const moveQuestionInSection = (sectionId: string, fromIndex: number, toIndex: number): void => {
    if (fromIndex === toIndex) return;

    s._q.update((q: Questionnaire): Questionnaire => {
      const si = q.sections.findIndex((sec) => sec.id === sectionId);
      if (si < 0) return q;

      const sec = q.sections[si];
      const ids = [...(sec.questionIds ?? [])];

      if (fromIndex < 0 || fromIndex >= ids.length) return q;
      if (toIndex < 0 || toIndex >= ids.length) return q;

      moveItemInArray(ids, fromIndex, toIndex);

      const sections = [...q.sections];
      sections[si] = { ...sec, questionIds: ids };

      return { ...q, sections };
    });
  };

  /** Vrati pitanja za sekciju po redoslijedu questionIds. */
  const getQuestionsForSection = (sectionId: string): Question[] => {
    const q = s._q();
    const map = s._questions();
    const sec = q.sections.find((x) => x.id === sectionId);
    if (!sec) return [];

    return (sec.questionIds ?? [])
      .map((id) => map[id])
      .filter((x): x is Question => !!x);
  };

  /** Update text-a na pitanju. */
  const updateQuestionText = (questionId: string, text: string): void => {
    s._questions.update((map: QuestionsMap): QuestionsMap => {
      const q = map[questionId];
      if (!q) return map;
      return { ...map, [questionId]: { ...q, text } };
    });
  };


  return {
    setActiveQuestion,
    clearActiveQuestion,
    addQuestion,
    moveQuestionInSection,
    getQuestionsForSection,
    updateQuestionText,
  };
}
