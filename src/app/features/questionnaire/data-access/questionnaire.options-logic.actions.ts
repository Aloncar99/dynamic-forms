import type { OptionsMap, QuestionnaireState, QuestionsMap } from './questionnaire.state';
import type {
  Option as QuestionOption,
  LogicRule,
  JumpTarget,
} from '../../../shared/models/questionnaire.model';
import { uid } from './questionnaire.utils';

export function createOptionsAndLogicActions(s: QuestionnaireState) {
  // =========================
  // OPTIONS
  // =========================

  /** Vraca opcije po redoslijedu (optionIds) za dato pitanje. */
  const getOptionsForQuestion = (questionId: string): QuestionOption[] => {
    const q = s._questions()[questionId];
    if (!q) return [];

    const map = s._options();
    return (q.optionIds ?? [])
      .map((id) => map[id])
      .filter((x): x is QuestionOption => !!x);
  };

  /** Dodaje novu opciju u pitanje (default vrijednosti). */
  const addOption = (questionId: string): void => {
    const q = s._questions()[questionId];
    if (!q) return;

    const newOptionId = uid('o');

    const option: QuestionOption = {
      id: newOptionId,
      questionId,
      text: 'Option',
      redFlag: false,
      comment: '',
      points: null,
    };

    // 1) upisi opciju u mapu
    s._options.update((map: OptionsMap): OptionsMap => ({ ...map, [newOptionId]: option }));

    // 2) linkaj opciju u pitanje (redoslijed)
    s._questions.update((map: QuestionsMap): QuestionsMap => {
      const curr = map[questionId];
      if (!curr) return map;

      return {
        ...map,
        [questionId]: {
          ...curr,
          optionIds: [...(curr.optionIds ?? []), newOptionId],
        },
      };
    });
  };

  /** Update text-a opcije. */
  const updateOptionText = (optionId: string, text: string): void => {
    s._options.update((map: OptionsMap): OptionsMap => {
      const o = map[optionId];
      if (!o) return map;
      return { ...map, [optionId]: { ...o, text } };
    });
  };

  /** Toggle redFlag na opciji. */
  const toggleOptionRedFlag = (optionId: string, value: boolean): void => {
    s._options.update((map: OptionsMap): OptionsMap => {
      const o = map[optionId];
      if (!o) return map;
      return { ...map, [optionId]: { ...o, redFlag: value } };
    });
  };

  /** Update komentara na opciji. */
  const updateOptionComment = (optionId: string, comment: string): void => {
    s._options.update((map: OptionsMap): OptionsMap => {
      const o = map[optionId];
      if (!o) return map;
      return { ...map, [optionId]: { ...o, comment } };
    });
  };

  /** Update points (string -> number|null). */
  const updateOptionPoints = (optionId: string, pointsRaw: string): void => {
    const trimmed = (pointsRaw ?? '').trim();
    const parsed = trimmed === '' ? null : Number(trimmed);
    const safe = parsed !== null && Number.isFinite(parsed) ? parsed : null;

    s._options.update((map: OptionsMap): OptionsMap => {
      const o = map[optionId];
      if (!o) return map;
      return { ...map, [optionId]: { ...o, points: safe } };
    });
  };

  /**
   * Brise opciju i:
   * - ukloni je iz question.optionIds
   * - ukloni eventualna logic pravila koja je koriste (whenOptionId)
   */
  const removeOption = (questionId: string, optionId: string): void => {
    // 1) obrisi iz options mape
    s._options.update((map: OptionsMap): OptionsMap => {
      if (!map[optionId]) return map;
      const { [optionId]: _removed, ...rest } = map;
      return rest;
    });

    // 2) cleanup na pitanju
    s._questions.update((map: QuestionsMap): QuestionsMap => {
      const q = map[questionId];
      if (!q) return map;

      const optionIds = (q.optionIds ?? []).filter((id) => id !== optionId);
      const logic = (q.logic ?? []).filter((r) => r.whenOptionId !== optionId);

      return { ...map, [questionId]: { ...q, optionIds, logic } };
    });
  };

  // =========================
  // CONDITIONAL LOGIC
  // =========================

  /** Dodaje prazno logic pravilo za pitanje. */
  const addLogicRule = (questionId: string): void => {
    s._questions.update((map: QuestionsMap): QuestionsMap => {
      const q = map[questionId];
      if (!q) return map;

      const rule: LogicRule = {
        whenOptionId: '',
        jumpTo: { kind: 'question', targetId: '' },
      };

      return { ...map, [questionId]: { ...q, logic: [...(q.logic ?? []), rule] } };
    });
  };

  /** Ukloni logic rule po index-u. */
  const removeLogicRule = (questionId: string, index: number): void => {
    s._questions.update((map: QuestionsMap): QuestionsMap => {
      const q = map[questionId];
      if (!q) return map;

      const logic = [...(q.logic ?? [])];
      logic.splice(index, 1);

      return { ...map, [questionId]: { ...q, logic } };
    });
  };

  /** Update option-a koji je uslov (whenOptionId). */
  const updateLogicWhenOption = (questionId: string, index: number, optionId: string): void => {
    s._questions.update((map: QuestionsMap): QuestionsMap => {
      const q = map[questionId];
      if (!q) return map;

      const logic = [...(q.logic ?? [])];
      const curr = logic[index];
      if (!curr) return map;

      logic[index] = { ...curr, whenOptionId: optionId };
      return { ...map, [questionId]: { ...q, logic } };
    });
  };

  /** Update tip targeta (question/section) + reset targetId. */
  const updateLogicJumpKind = (
    questionId: string,
    index: number,
    kind: JumpTarget['kind']
  ): void => {
    s._questions.update((map: QuestionsMap): QuestionsMap => {
      const q = map[questionId];
      if (!q) return map;

      const logic = [...(q.logic ?? [])];
      const curr = logic[index];
      if (!curr) return map;

      logic[index] = <LogicRule>{ ...curr, jumpTo: { kind, targetId: '' } };
      return { ...map, [questionId]: { ...q, logic } };
    });
  };

  /** Update konkretan targetId (id sekcije ili id pitanja). */
  const updateLogicTarget = (questionId: string, index: number, targetId: string): void => {
    s._questions.update((map: QuestionsMap): QuestionsMap => {
      const q = map[questionId];
      if (!q) return map;

      const logic = [...(q.logic ?? [])];
      const curr = logic[index];
      if (!curr) return map;

      logic[index] = <LogicRule>{ ...curr, jumpTo: { ...curr.jumpTo, targetId } };
      return { ...map, [questionId]: { ...q, logic } };
    });
  };

  return {
    // options
    getOptionsForQuestion,
    addOption,
    updateOptionText,
    toggleOptionRedFlag,
    updateOptionComment,
    updateOptionPoints,
    removeOption,

    // logic
    addLogicRule,
    removeLogicRule,
    updateLogicWhenOption,
    updateLogicJumpKind,
    updateLogicTarget,
  };
}
