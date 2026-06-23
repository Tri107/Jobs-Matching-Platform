import type { Job } from "../types/job.js";
import type {
  JobSearchQuery,
  JobSearchResponse,
  JobSearchSort,
} from "../types/jobSearch.js";
import { scanJobs } from "../repositories/jobRepository.js";
import {
  decodePaginationToken,
  encodePaginationToken,
} from "../utils/paginationToken.js";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const DEFAULT_SORT: JobSearchSort = "relevance";
const ALLOWED_SORTS: readonly JobSearchSort[] = [
  "relevance",
  "latest",
  "posted_at_asc",
];

export class JobSearchValidationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "JobSearchValidationError";
  }
}

export interface SearchJobsParams {
  tableName: string;
  queryStringParameters?: Record<string, string | undefined>;
}

export async function searchJobs({
  tableName,
  queryStringParameters,
}: SearchJobsParams): Promise<JobSearchResponse> {
  const filters = parseJobSearchQuery(queryStringParameters);
  const exclusiveStartKey = parseExclusiveStartKey(filters.nextToken);

  const { items, lastEvaluatedKey } = await scanJobs({
    tableName,
    limit: filters.limit,
    ...(exclusiveStartKey ? { exclusiveStartKey } : {}),
  });

  const filteredItems = filterJobs(items, filters);
  const sortedItems = sortJobs(filteredItems, filters);
  const nextToken = encodePaginationToken(lastEvaluatedKey);

  return {
    count: sortedItems.length,
    items: sortedItems,
    ...(nextToken ? { nextToken } : {}),
    filters,
  };
}

export function parseJobSearchQuery(
  queryStringParameters: Record<string, string | undefined> = {}
): JobSearchQuery {
  return {
    ...optionalString("keyword", queryStringParameters.keyword),
    ...optionalString("location", queryStringParameters.location),
    ...optionalString("scheduleType", queryStringParameters.scheduleType),
    ...optionalString("postedAt", queryStringParameters.postedAt),
    sort: parseSort(queryStringParameters.sort),
    limit: parseLimit(queryStringParameters.limit),
    ...optionalString("nextToken", queryStringParameters.nextToken),
  };
}

function optionalString<T extends keyof JobSearchQuery>(
  key: T,
  value?: string
): Partial<Pick<JobSearchQuery, T>> {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return {};
  }

  return { [key]: trimmedValue } as Partial<Pick<JobSearchQuery, T>>;
}

function parseLimit(rawLimit?: string): number {
  if (!rawLimit) {
    return DEFAULT_LIMIT;
  }

  const parsedLimit = Number(rawLimit);

  if (!Number.isFinite(parsedLimit)) {
    throw new JobSearchValidationError("limit must be a number");
  }

  if (parsedLimit <= 0) {
    throw new JobSearchValidationError("limit must be greater than 0");
  }

  if (!Number.isInteger(parsedLimit)) {
    throw new JobSearchValidationError("limit must be an integer");
  }

  return Math.min(parsedLimit, MAX_LIMIT);
}

function parseSort(rawSort?: string): JobSearchSort {
  if (!rawSort) {
    return DEFAULT_SORT;
  }

  const sort = rawSort.trim() as JobSearchSort;

  if (!ALLOWED_SORTS.includes(sort)) {
    throw new JobSearchValidationError(
      `sort must be one of: ${ALLOWED_SORTS.join(", ")}`
    );
  }

  return sort;
}

function parseExclusiveStartKey(
  nextToken?: string
): Record<string, unknown> | undefined {
  try {
    return decodePaginationToken(nextToken);
  } catch (error) {
    throw new JobSearchValidationError("nextToken has invalid format", {
      cause: error,
    });
  }
}

function filterJobs(items: Job[], filters: JobSearchQuery): Job[] {
  return items.filter((job) => {
    return (
      matchesKeyword(job, filters.keyword) &&
      containsValue(job.location, filters.location) &&
      equalsValue(job.scheduleType, filters.scheduleType) &&
      containsValue(job.postedAt, filters.postedAt)
    );
  });
}

function matchesKeyword(job: Job, keyword?: string): boolean {
  if (!keyword) {
    return true;
  }

  const normalizedKeyword = normalize(keyword);
  const searchableText = [
    job.title,
    job.originalTitle,
    job.companyName,
    job.location,
    job.scheduleType,
    job.description,
  ]
    .map(normalize)
    .join(" ");

  return searchableText.includes(normalizedKeyword);
}

function containsValue(value: string, filterValue?: string): boolean {
  if (!filterValue) {
    return true;
  }

  return normalize(value).includes(normalize(filterValue));
}

function equalsValue(value: string, filterValue?: string): boolean {
  if (!filterValue) {
    return true;
  }

  return normalize(value) === normalize(filterValue);
}

function sortJobs(items: Job[], filters: JobSearchQuery): Job[] {
  const indexedItems = items.map((item, index) => ({ item, index }));

  indexedItems.sort((left, right) => {
    if (filters.sort === "latest") {
      return (
        compareJobDates(right.item, left.item) || left.index - right.index
      );
    }

    if (filters.sort === "posted_at_asc") {
      return (
        compareJobDates(left.item, right.item) || left.index - right.index
      );
    }

    if (filters.keyword) {
      return (
        relevanceScore(right.item, filters.keyword) -
          relevanceScore(left.item, filters.keyword) ||
        left.index - right.index
      );
    }

    return left.index - right.index;
  });

  return indexedItems.map(({ item }) => item);
}

function relevanceScore(job: Job, keyword: string): number {
  const normalizedKeyword = normalize(keyword);

  return [job.title, job.originalTitle].some((value) =>
    normalize(value).includes(normalizedKeyword)
  )
    ? 1
    : 0;
}

function compareJobDates(left: Job, right: Job): number {
  const leftValue = getSortableDateValue(left);
  const rightValue = getSortableDateValue(right);

  if (leftValue.numeric !== undefined && rightValue.numeric !== undefined) {
    return leftValue.numeric - rightValue.numeric;
  }

  return leftValue.text.localeCompare(rightValue.text);
}

function getSortableDateValue(job: Job): { numeric?: number; text: string } {
  const value = job.postedAt || job.createdAt;
  const parsedDate = Date.parse(value);

  if (Number.isFinite(parsedDate)) {
    return {
      numeric: parsedDate,
      text: value,
    };
  }

  return { text: value };
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}
