import { postgraphile } from 'postgraphile';
import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter';
import PgSimplifyInflectorPlugin from '@graphile-contrib/pg-simplify-inflector';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

export const postgraphileMiddleware = postgraphile(DATABASE_URL, 'public', {
  subscriptions: true,
  watchPg: true,
  dynamicJson: true,
  setofFunctionsContainNulls: false,
  ignoreRBAC: false,
  showErrorStack: 'json',
  extendedErrors: ['hint', 'detail', 'errcode'],
  appendPlugins: [PgSimplifyInflectorPlugin, ConnectionFilterPlugin],
  exportGqlSchemaPath: 'schema.graphql',
  graphiql: true,
  legacyRelations: 'omit',
  simpleCollections: 'only',
  enhanceGraphiql: true,
  graphileBuildOptions: {
    pgOmitListSuffix: true,
    pgShortPk: true,
    connectionFilterRelations: true,
    connectionFilterUseListInflectors: true,
    connectionFilterAllowedOperators: [
      'isNull',
      'equalTo',
      'notEqualTo',
      'lessThan',
      'lessThanOrEqualTo',
      'greaterThan',
      'greaterThanOrEqualTo',
      'in',
      'notIn',
      'contains',
    ],
  },
});
