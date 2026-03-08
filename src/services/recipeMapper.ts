export type RecipeStep = {
  text?: string;
  image?: string | null;
};

export type RecipeIngredient = {
  name?: string;
  amount?: string;
};

export type RecipeItem = {
  id: string;
  sourceIds: string[];
  title: string;
  info: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  viewCount: number;
  thumbnailImage?: string;
  instagramLink?: string;
  videoLink?: string;
  videoFile?: string;
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

const getNumber = (record: Record<string, unknown>, keys: string[], fallback = 0): number => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return fallback;
};

const toArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
};

const toRecipeKey = (recipe: RecipeItem): string => {
  return [
    recipe.title.trim().toLowerCase(),
    recipe.info.trim(),
    (recipe.instagramLink ?? '').trim(),
    (recipe.videoLink ?? '').trim(),
  ].join('||');
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

export const parseIngredients = (value: unknown): RecipeIngredient[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const record = asRecord(item);
        return {
          name: getString(record, ['name', 'ingredientName', 'title']) ?? '',
          amount: getString(record, ['amount', 'quantity', 'measure']) ?? '',
        };
      })
      .filter((item) => (item.name ?? '').trim().length > 0 || (item.amount ?? '').trim().length > 0);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parseIngredients(parsed);
    } catch (_error) {
      return value
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          const [name, ...rest] = line.split(/\s+/);
          return { name, amount: rest.join(' ') };
        });
    }
  }

  const record = asRecord(value);
  if (Object.keys(record).length > 0 && record.ingredients) {
    return parseIngredients(record.ingredients);
  }

  return [];
};

export const normalizeRecipe = (item: unknown, index: number): RecipeItem => {
  const record = asRecord(item);

  return {
    id: getString(record, ['id', 'recipeId', '_id']) ?? String(index),
    sourceIds: [getString(record, ['id', 'recipeId', '_id']) ?? String(index)],
    title: getString(record, ['title', 'recipeTitle']) ?? 'タイトル未設定',
    info: getString(record, ['info', 'recipeInfo', 'description']) ?? '',
    ingredients: parseIngredients(record.ingredients ?? record.recipeIngredients),
    steps: parseSteps(record.steps ?? record.recipeSteps),
    viewCount: getNumber(record, ['viewCount', 'recipeViewCount', 'views'], 0),
    thumbnailImage: getString(record, ['thumbnailImage', 'recipeThumbnailImage', 'representativeImage']),
    instagramLink: getString(record, ['instagramLink', 'recipeInstagramLink', 'instagramUrl']),
    videoLink: getString(record, ['videoLink', 'recipeVideoLink', 'videoUrl']),
    videoFile: getString(record, ['videoFile', 'recipeVideoFile']),
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
      ingredients: current.ingredients.length > 0 ? current.ingredients : recipe.ingredients,
      steps: mergedSteps,
      viewCount: Math.max(current.viewCount, recipe.viewCount),
      sourceIds: Array.from(new Set([...current.sourceIds, ...recipe.sourceIds])),
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
      return list.map((item, index) => normalizeRecipe(item, index));
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
