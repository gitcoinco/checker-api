import { env } from './env';
import { postgraphile } from 'postgraphile';
import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter';
import PgSimplifyInflectorPlugin from '@graphile-contrib/pg-simplify-inflector';

export const postgraphileMiddleware = postgraphile(env.DATABASE_URL, 'public', {
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
