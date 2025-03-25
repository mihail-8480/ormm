import { SQLStatement } from "sql-template-strings";
import { IClient, IDatabaseService } from "../database-service";
import {
  createIdentifier,
  WhereFilter,
  createWhereFilter,
  PaginationFilter,
  OrderFilter,
  createPaginationFilter,
  createOrderFilter,
  UpdateFilter,
  createUpdateFilter,
  CreateFilter,
  createCreateFilter,
} from "./filters";
import { IModel, Index } from "./model";
import { assert } from "@mojsoski/assert";

export abstract class ModelRepository<Table extends string, T extends IModel> {
  protected tableName: Table;
  protected client: IClient;
  protected SQL: IDatabaseService["SQL"];
  protected debugQuery: (sql: SQLStatement) => SQLStatement = (x) => x;
  protected constructor(tableName: Table, databaseService: IDatabaseService) {
    this.tableName = tableName;
    this.client = databaseService.client;
    this.SQL = databaseService.SQL;
    if (databaseService.debugQuery) {
      this.debugQuery = databaseService.debugQuery;
    }
  }

  public async getById(id: string) {
    const { rows } = await this.client.query<T>(
      this.debugQuery(
        this.SQL`SELECT * FROM `
          .append(createIdentifier(this.tableName))
          .append(this.SQL` WHERE "id" = ${id} LIMIT 1`)
      )
    );
    if (!rows.length) {
      return null;
    }
    return rows[0];
  }

  public async remove(where: WhereFilter<T>) {
    const { rows } = await this.client.query<Index>(
      this.debugQuery(
        this.SQL`DELETE FROM `
          .append(createIdentifier(this.tableName))
          .append(createWhereFilter(where, this.SQL))
          .append(this.SQL` RETURNING "id"`)
      )
    );
    return rows.map((item) => item.id);
  }

  public async count(where: WhereFilter<T>) {
    const { rows } = await this.client.query<{ count: number }>(
      this.debugQuery(
        this.SQL`SELECT COUNT(*) as "count" FROM `
          .append(createIdentifier(this.tableName))
          .append(createWhereFilter(where, this.SQL))
      )
    );
    assert(rows.length === 1, "Invalid count query");
    return rows[0].count;
  }

  public async list(
    where: WhereFilter<T>,
    pagination?: PaginationFilter,
    order?: OrderFilter<T>
  ) {
    const { rows } = await this.client.query<T>(
      this.debugQuery(
        this.SQL`SELECT * FROM `
          .append(createIdentifier(this.tableName))
          .append(createWhereFilter(where, this.SQL))
          .append(createPaginationFilter(pagination, this.SQL))
          .append(createOrderFilter(order, this.SQL))
      )
    );
    return rows;
  }

  public async update(update: UpdateFilter<T>, where: WhereFilter<T>) {
    const { rows } = await this.client.query<Index>(
      this.debugQuery(
        this.SQL`UPDATE `
          .append(createIdentifier(this.tableName))
          .append(createUpdateFilter(update, this.SQL))
          .append(createWhereFilter(where, this.SQL))
          .append(this.SQL` RETURNING "id"`)
      )
    );
    return rows.map((item) => item.id);
  }

  public async create(create: CreateFilter<T>) {
    const {
      rows: [{ id }],
    } = await this.client.query<Index>(
      this.debugQuery(
        this.SQL`INSERT INTO `
          .append(createIdentifier(this.tableName))
          .append(createCreateFilter(create, this.SQL))
          .append(this.SQL` RETURNING "id"`)
      )
    );
    return id;
  }
}
