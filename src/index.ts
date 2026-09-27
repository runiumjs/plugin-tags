import { Plugin } from '@runium/types-plugin';

import { getTags, setTags } from './state.js';
import { processTasks } from './tags.js';

const PROJECT_START_COMMAND = 'project start';

export default function (): Plugin {
  return {
    name: 'tags',
    app: {
      commandOptionExtensions: [
        {
          command: PROJECT_START_COMMAND,
          options: [
            new runium.class.CommandOption(
              '-t, --tag <tag...>',
              'specify a tag to enable '
            ),
          ],
        },
      ],
    },
    project: {
      validationSchema: {
        tasks: {
          '*': {
            properties: {
              tags: {
                type: 'array',
                items: {
                  type: 'string',
                },
                minItems: 1,
              },
            },
          },
        },
      },
    },
    hooks: {
      app: {
        async beforeCommandRun({
          command,
          args,
        }: {
          command: string;
          args: unknown[];
        }): Promise<void> {
          if (command === PROJECT_START_COMMAND) {
            let tags = null;
            const options = args[args.length - 1];
            if (
              options &&
              typeof options === 'object' &&
              !Array.isArray(options)
            ) {
              tags ??= (options as Record<string, string[]>).tag;
            }

            if (tags) {
              setTags(tags);
              return;
            }
          }
          setTags([]);
        },
      },
      project: {
        async afterConfigParse(config) {
          return processTasks(config, getTags());
        },
      },
    },
  } as Plugin;
}
