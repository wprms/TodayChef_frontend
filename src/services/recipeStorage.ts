import { RecipeIngredient, RecipeItem, RecipeStep, parseIngredients } from './recipeMapper';

export type UploadRecipePayload = {
  title: string;
  info: string;
  ingredients?: RecipeIngredient[];
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
        const id = typeof record.id === 'string' ? record.id : `local-${Date.now()}`;
        return {
          id,
          sourceIds: [id],
          title: typeof record.title === 'string' ? record.title : 'タイトル未設定',
          info: typeof record.info === 'string' ? record.info : '',
          ingredients: parseIngredients(record.ingredients),
          steps: sanitizeSteps(record.steps),
          viewCount: typeof record.viewCount === 'number' ? record.viewCount : 0,
          instagramLink: typeof record.instagramLink === 'string' ? record.instagramLink : undefined,
          videoLink: typeof record.videoLink === 'string' ? record.videoLink : undefined,
        };
      });
  } catch (_error) {
    return [];
  }
};

export const saveLocalRecipe = (payload: UploadRecipePayload): RecipeItem => {
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const nextRecipe: RecipeItem = {
    id,
    sourceIds: [id],
    title: payload.title,
    info: payload.info,
    ingredients: payload.ingredients ?? [],
    steps: sanitizeSteps(payload.steps),
    viewCount: 0,
    instagramLink: payload.instagramLink,
    videoLink: payload.videoLink,
  };

  const current = loadLocalRecipes();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([nextRecipe, ...current]));

  return nextRecipe;
};
