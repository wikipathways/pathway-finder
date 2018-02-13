export type Direction = "asc" | "desc";
export interface SortCriterion {
  key: string;
  direction: Direction;
}

export function singleSort(direction: Direction, a, b) {
  if (a < b) {
    return direction === "asc" ? 1 : -1;
  } else if (a > b) {
    return direction === "asc" ? -1 : 1;
  } else {
    return 0;
  }
}

export function multiSort(sortCriteria: SortCriterion[], a, b) {
  return sortCriteria.reduce(function(acc, { key, direction }) {
    return acc !== 0 ? acc : singleSort(direction, a[key], b[key]);
  }, 0);
}
