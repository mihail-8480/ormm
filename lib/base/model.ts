export interface Index {
  id: string;
}

export interface IModel extends Index {
  created_at: Date;
  updated_at: Date;
}

export interface IBaseModel<T extends object = object> extends IModel {
  metadata: T;
}
