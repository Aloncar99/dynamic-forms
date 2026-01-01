import { computed, signal, type WritableSignal } from '@angular/core';
import type {
  Question,
  Questionnaire,
  Option as QuestionOption,
} from '../../../shared/models/questionnaire.model';
import { uid } from './questionnaire.utils';

/**
 * Pocetna sekcija mora imati ID unaprijed jer:
 * - _activeSectionId mora odmah imati validan id (UI se oslanja na to)
 */
export const initialSectionId = uid('s');

/**
 * Minimalni initial state:
 * - upitnik ima 1 sekciju
 * - sekcija trenutno nema pitanja
 */
const initial: Questionnaire = {
  id: uid('q'),
  title: 'Upitnik',
  sections: [
    {
      id: initialSectionId,
      code: 'S-001',
      title: 'Donec ultrices tincidunt arcu non',
      questionIds: [],
    },
  ],
};

export type QuestionsMap = Record<string, Question>;
export type OptionsMap = Record<string, QuestionOption>;

/**
 * createQuestionnaireState() => sve signale i computed držimo ovdje,
 * da actions fajlovi budu samo "mutatori" nad istim state-om.
 */
export function createQuestionnaireState() {
  // =======================
  // STATE (private signali)
  // =======================

  /** _q: upitnik + sekcije + redoslijed pitanja (preko questionIds). */
  const _q = signal<Questionnaire>(initial);

  /** _questions: mapa pitanja po id-u (normalizovan shape). */
  const _questions: WritableSignal<QuestionsMap> = signal<QuestionsMap>({});

  /**
   * _options: mapa opcija po id-u.
   * Opcije su odvojene od pitanja jer:
   * - lakse update (O(1))
   * - pitanje cuva samo optionIds i time cuvamo redoslijed opcija
   */
  const _options: WritableSignal<OptionsMap> = signal<OptionsMap>({});

  /** Aktivna sekcija u builder UI-u. */
  const _activeSectionId = signal<string>(initialSectionId);

  /** Globalno aktivno pitanje (samo jedno u cijelom builderu). */
  const _activeQuestionId = signal<string | null>(null);

  // =======================
  // SELECTORS (computed)
  // =======================

  const questionnaire = computed(() => _q());
  const sections = computed(() => _q().sections);
  const activeSectionId = computed(() => _activeSectionId());
  const activeQuestionId = computed(() => _activeQuestionId());
  const questionsById = computed(() => _questions());
  const optionsById = computed(() => _options());

  const activeSection = computed(() => {
    const id = _activeSectionId();
    return _q().sections.find((s) => s.id === id) ?? null;
  });

  const state = computed(() => ({
    questionnaire: _q(),
    questions: _questions(),
    options: _options(),
    activeSectionId: _activeSectionId(),
    activeQuestionId: _activeQuestionId(),
  }));

  return {
    // raw state (actions koriste ovo)
    _q,
    _questions,
    _options,
    _activeSectionId,
    _activeQuestionId,

    // selectors (store re-export)
    questionnaire,
    sections,
    activeSectionId,
    activeQuestionId,
    questionsById,
    optionsById,
    activeSection,
    state,
  };
}

export type QuestionnaireState = ReturnType<typeof createQuestionnaireState>;
