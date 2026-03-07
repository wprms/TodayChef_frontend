export type RecipeStep = {
  text?: string;
  image?: string | null;
};

export type RecipeItem = {
  id: string;
  title: string;
  info: string;
  steps: RecipeStep[];
  thumbnailImage?: string;
  instagramLink?: string;
  videoLink?: string;
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
};

const getString = (record: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return undefined;
};

const toArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
};

const toRecipeKey = (recipe: RecipeItem): string => {
  return [recipe.title.trim().toLowerCase(), (recipe.instagramLink ?? '').trim(), (recipe.videoLink ?? '').trim()].join('||');
};

export const parseSteps = (value: unknown): RecipeStep[] => {
  if (Array.isArray(value)) {
    return value.map((step) => {
      const record = asRecord(step);
      return {
        text: getString(record, ['text', 'description', 'content']),
        image: getString(record, ['image', 'imageUrl', 'img']) ?? null,
      };
    });
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parseSteps(parsed);
    } catch (_error) {
      return [];
    }
  }

  const record = asRecord(value);
  if (Object.keys(record).length > 0) {
    const nestedSteps = record.steps;
    if (nestedSteps) {
      return parseSteps(nestedSteps);
    }
  }

  return [];
};

export const normalizeRecipe = (item: unknown, index: number): RecipeItem => {
  const record = asRecord(item);

  return {
    id: getString(record, ['id', 'recipeId', '_id']) ?? String(index),
    title: getString(record, ['title', 'recipeTitle']) ?? 'タイトル未設定',
    info: getString(record, ['info', 'recipeInfo', 'description']) ?? '',
    steps: parseSteps(record.steps ?? record.recipeSteps),
    thumbnailImage: getString(record, ['thumbnailImage', 'recipeThumbnailImage', 'representativeImage']),
    instagramLink: getString(record, ['instagramLink', 'recipeInstagramLink', 'instagramUrl']),
    videoLink: getString(record, ['videoLink', 'recipeVideoLink', 'videoUrl']),
  };
};

const mergeAsRecipeUnits = (list: RecipeItem[]): RecipeItem[] => {
  const recipeMap = new Map<string, RecipeItem>();

  for (const recipe of list) {
    const key = toRecipeKey(recipe);

    if (!recipeMap.has(key)) {
      recipeMap.set(key, { ...recipe, steps: [...recipe.steps] });
      continue;
    }

    const current = recipeMap.get(key)!;
    const mergedSteps = [...current.steps, ...recipe.steps].filter(
      (step, index, arr) =>
        arr.findIndex(
          (target) => (target.text ?? '') === (step.text ?? '') && (target.image ?? '') === (step.image ?? ''),
        ) === index,
    );

    recipeMap.set(key, {
      ...current,
      info: current.info || recipe.info,
      steps: mergedSteps,
    });
  }

  return Array.from(recipeMap.values());
};

export const mergeRecipeUnits = (list: RecipeItem[]): RecipeItem[] => mergeAsRecipeUnits(list);

export const extractRecipes = (payload: unknown): RecipeItem[] => {
  const root = asRecord(payload);
  const candidates: unknown[] = [payload, root.result, root.recipes, root.list, root.items, root.data, root.content];

  for (const candidate of candidates) {
    const list = toArray(candidate);
    if (list.length > 0) {
      const normalized = list.map((item, index) => normalizeRecipe(item, index));
      return mergeAsRecipeUnits(normalized);
    }
  }

  return [];
};

export const extractSingleRecipe = (payload: unknown): RecipeItem | null => {
  const list = extractRecipes(payload);
  if (list.length > 0) {
    return list[0];
  }

  const root = asRecord(payload);
  const singleCandidates = [root.result, root.recipe, root.item, root.data, payload];

  for (const candidate of singleCandidates) {
    const record = asRecord(candidate);
    if (Object.keys(record).length > 0) {
      return normalizeRecipe(record, 0);
    }
  }

  return null;
};
