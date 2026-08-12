export const CATALOG_PAGE_SIZE = 24;
export const CATALOG_FETCH_SIZE = 500;
export const CATALOG_INITIAL_RESULTS = 16;
export const CATALOG_LOAD_STEP = 12;

export type CatalogSearchParam = string | string[] | undefined;

export type CatalogSearchParams = Record<string, CatalogSearchParam>;

export function firstCatalogParam(value: CatalogSearchParam) {
  return (Array.isArray(value) ? value[0] : value || "").trim();
}

export function catalogParamList(value: CatalogSearchParam) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.flatMap((item) => item.split(",")).map((item) => item.trim()).filter(Boolean);
}

export function parseCatalogPage(value: CatalogSearchParam) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number(candidate);

  if (!Number.isSafeInteger(parsed) || parsed < 1) return 1;
  return parsed;
}
