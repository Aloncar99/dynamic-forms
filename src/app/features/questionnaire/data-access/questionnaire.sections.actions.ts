import type { QuestionnaireState } from './questionnaire.state';
import type { Questionnaire, Section } from '../../../shared/models/questionnaire.model';
import { uid, nextCode } from './questionnaire.utils';

/**
 * Sections actions => sve sto mijenja sekcije:
 * - aktivna sekcija
 * - dodavanje sekcije
 * - naslov sekcije
 */
export function createSectionActions(s: QuestionnaireState) {
  /** Postavi aktivnu sekciju u UI-u. */
  const setActiveSection = (sectionId: string): void => {
    s._activeSectionId.set(sectionId);
  };

  /** Dodaj novu sekciju na kraj. */
  const addSection = (): void => {
    const newSectionId = uid('s');

    s._q.update((q: Questionnaire): Questionnaire => {
      const newSection: Section = {
        id: newSectionId,
        code: nextCode('S', q.sections.map((x) => x.code)),
        title: 'New section',
        questionIds: [],
      };

      return { ...q, sections: [...q.sections, newSection] };
    });

    // UI odmah ide na novu sekciju
    s._activeSectionId.set(newSectionId);
  };

  /** Dodaj novu sekciju odmah poslije neke sekcije. */
  const addSectionAfter = (fromSectionId: string): void => {
    const newSectionId = uid('s');

    s._q.update((q: Questionnaire): Questionnaire => {
      const newSection: Section = {
        id: newSectionId,
        code: nextCode('S', q.sections.map((x) => x.code)),
        title: 'New section',
        questionIds: [],
      };

      const idx = q.sections.findIndex((sec) => sec.id === fromSectionId);
      const sections = [...q.sections];

      if (idx >= 0) sections.splice(idx + 1, 0, newSection);
      else sections.push(newSection);

      return { ...q, sections };
    });

    s._activeSectionId.set(newSectionId);
  };

  /** Update naslova sekcije. */
  const updateSectionTitle = (sectionId: string, title: string): void => {
    s._q.update((q) => ({
      ...q,
      sections: q.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, title } : sec
      ),
    }));
  };

  return { setActiveSection, addSection, addSectionAfter, updateSectionTitle };
}
