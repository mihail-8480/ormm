import { IDatabaseService } from "../database-service";
import { IModel } from "./model";

type OmitKeysByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

export type WhereFilter<T extends IModel> = OmitKeysByType<Partial<T>, object>;

export type UpdateFilter<T extends IModel> = Omit<
  Partial<T>,
  "created_at" | "updated_at"
>;

export type CreateFilter<T extends IModel> = Omit<
  T,
  "created_at" | "updated_at" | "id"
>;

export type PaginationFilter = { limit?: number; offset?: number } | undefined;

export type OrderFilter<T extends IModel> =
  | Partial<Record<keyof T, "asc" | "desc">>
  | undefined;

export function createIdentifier(str: string) {
  return '"' + str.replace(/"/g, '""') + '"';
}

export function createWhereFilter<T extends IModel>(
  where: WhereFilter<T>,
  SQL: IDatabaseService["SQL"]
) {
  const entries = Object.entries(where);
  if (entries.length === 0) {
    return SQL` `;
  }
  return SQL` WHERE `.append(
    entries.reduce(
      (prev, [key, value], idx) =>
        prev
          .append(idx === 0 ? SQL`` : SQL` AND `)
          .append(createIdentifier(key))
          .append(SQL` = ${value} `),
      SQL` `
    )
  );
}

export function createOrderFilter<T extends IModel>(
  order: OrderFilter<T>,
  SQL: IDatabaseService["SQL"]
) {
  if (order === undefined) {
    return SQL` `;
  }
  const entries: [string, "asc" | "desc"][] = Object.entries(order);

  if (entries.length === 0) {
    return SQL` `;
  }

  return SQL` ORDER BY `.append(
    entries.reduce(
      (prev, [key, value], idx) =>
        prev
          .append(idx === 0 ? SQL`` : SQL`, `)
          .append(createIdentifier(key))
          .append(value === "asc" ? SQL` ASC ` : SQL` DESC `),
      SQL` `
    )
  );
}

export function createPaginationFilter(
  pagination: PaginationFilter,
  SQL: IDatabaseService["SQL"]
) {
  if (pagination === undefined) {
    return SQL` `;
  }

  let sql = SQL` `;

  if (pagination.limit !== undefined) {
    sql = sql.append(SQL` LIMIT ${pagination.limit} `);
  }

  if (pagination.offset !== undefined) {
    sql = sql.append(SQL` OFFSET ${pagination.offset} `);
  }

  return sql;
}

export function createUpdateFilter<T extends IModel>(
  update: UpdateFilter<T>,
  SQL: IDatabaseService["SQL"]
) {
  const entries = Object.entries(update);
  if (entries.length === 0) {
    return SQL` `;
  }
  return SQL` SET `.append(
    entries.reduce(
      (prev, [key, value], idx) =>
        prev
          .append(idx === 0 ? SQL`` : SQL`, `)
          .append(createIdentifier(key))
          .append(SQL` = ${value} `),
      SQL` `
    )
  );
}

export function createCreateFilter<T extends IModel>(
  create: CreateFilter<T>,
  SQL: IDatabaseService["SQL"]
) {
  return SQL` ( `
    .append(
      Object.keys(create).reduce(
        (prev, key, idx) =>
          prev
            .append(idx === 0 ? SQL`` : SQL`, `)
            .append(createIdentifier(key)),
        SQL``
      )
    )
    .append(SQL` ) VALUES `)
    .append(SQL`( `)
    .append(
      Object.values(create).reduce<ReturnType<typeof SQL>>(
        (prev, value, idx) =>
          prev.append(idx === 0 ? SQL`` : SQL`, `).append(SQL`${value}`),
        SQL``
      )
    )
    .append(SQL`) `);
}
