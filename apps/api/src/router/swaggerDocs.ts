import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import { ObjValues, trimMultiline } from '@arthurka/ts-utils';
import { API_URL } from '@repo/common/src/envVariables/public';
import { OpenAPIV3 } from 'openapi-types';
import type { App } from '../app';
import { docTags } from '../docTags';
import { apiVersion } from '../apiVersion';

export const mountSwaggerDocs = async (app: App) => {
  await app.register(swagger, {
    transform: jsonSchemaTransform,
    openapi: {
      info: {
        title: 'GitHub Release Notification API',
        version: apiVersion,
        description: 'GitHub Release Notification API that allows users to subscribe to email notifications about new releases of a chosen GitHub repository.',
      },
      servers: [{
        url: API_URL,
      }],
      tags: ObjValues(docTags).map(({ name, description }): OpenAPIV3.TagObject => ({
        name,
        description,
      })),
    },
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      displayRequestDuration: true,
    },
    theme: {
      title: 'GitHub Checker API',
      css: [
        {
          filename: '',
          content: trimMultiline`
            .download-url-wrapper {
              visibility: hidden;
            }
          `,
        },
      ],
    },
  });
};
