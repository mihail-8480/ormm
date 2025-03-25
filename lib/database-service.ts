import { SQL, SQLStatement } from "sql-template-strings";
import type { QueryConfig, QueryResultRow, QueryResult } from "pg";

export interface IClient {
  query<R extends QueryResultRow = any, I = any[]>(
    queryConfig: QueryConfig<I>
  ): Promise<QueryResult<R>>;
}

export interface IDatabaseService {
  SQL: typeof SQL;
  client: IClient;
  debugQuery?: (q: SQLStatement) => SQLStatement;
}

export function createDatabaseService(
  client: IClient,
  debugQuery?: (q: SQLStatement) => SQLStatement
): IDatabaseService {
  return { client, SQL, debugQuery };
}
