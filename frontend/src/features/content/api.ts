/**
 * Backwards-compat shim for legacy callers that imported from
 * features/content/api. Phase 2 introduced sections/lessons APIs
 * that supersede the old "modules" endpoints. This file re-exports
 * the new APIs under the old names so the rest of the app keeps
 * working while we migrate components piece-by-piece.
 */
export {
  listSections as getCourseModules,
  createSection as createModule,
  updateSection as updateModule,
  deleteSection as deleteModule,
} from '../sections/api';

export {
  listLessons as getModuleLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getLesson,
} from '../lessons/api';
