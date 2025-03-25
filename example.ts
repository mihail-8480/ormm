import { Pool } from "pg";
import {
  createDatabaseService,
  IDatabaseService,
  ModelRepository,
} from "./lib";
import { IBaseModel } from "./lib/base";

const pool = new Pool();

const databaseService = createDatabaseService(pool, (sql) => {
  console.log(`QUERY`, sql.text);
  return sql;
});

interface Example extends IBaseModel<{ someMetadata: string }> {
  flag: boolean;
}

class ExampleRepository extends ModelRepository<"examples", Example> {
  constructor(databaseService: IDatabaseService) {
    super("examples", databaseService);
  }
}

const examples = new ExampleRepository(databaseService);

examples.create({
  flag: true,
  metadata: {
    someMetadata: "Hi!",
  },
});

examples.update({ metadata: { someMetadata: "Changed!" } }, { flag: true });

examples.list({ flag: false }, { limit: 5 }, { created_at: "desc" });

examples.count({ flag: true });

examples.getById("4cf674d8-f260-4c69-af51-8532863b9476");

examples.remove({ flag: true, id: "4cf674d8-f260-4c69-af51-8532863b9476" });
