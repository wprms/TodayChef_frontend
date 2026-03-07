import { RecipeItem, RecipeStep } from './recipeMapper';

export type UploadRecipePayload = {
  title: string;
  info: string;
  steps: RecipeStep[];
  instagramLink?: string;
  videoLink?: string;
};

const STORAGE_KEY = 'todaychef_recipes';

const sanitizeSteps = (steps: unknown): RecipeStep[] => {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps
    .filter((step) => step && typeof step === 'object')
    .map((step) => {
      const record = step as Record<string, unknown>;
      return {
        text: typeof record.text === 'string' ? record.text : '',
        image: typeof record.image === 'string' ? record.image : null,
      };
    });
};

export const loadLocalRecipes = (): RecipeItem[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const record = item as Record<string, unknown>;
        return {
          id: typeof record.id === 'string' ? record.id : `local-${Date.now()}`,
          title: typeof record.title === 'string' ? record.title : 'タイトル未設定',
          info: typeof record.info === 'string' ? record.info : '',
          steps: sanitizeSteps(record.steps),
          instagramLink: typeof record.instagramLink === 'string' ? record.instagramLink : undefined,
          videoLink: typeof record.videoLink === 'string' ? record.videoLink : undefined,
        };
      });
  } catch (_error) {
    return [];
  }
};

export const saveLocalRecipe = (payload: UploadRecipePayload): RecipeItem => {
  const nextRecipe: RecipeItem = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: payload.title,
    info: payload.info,
    steps: sanitizeSteps(payload.steps),
    instagramLink: payload.instagramLink,
    videoLink: payload.videoLink,
  };

  const current = loadLocalRecipes();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([nextRecipe, ...current]));

  return nextRecipe;
};
