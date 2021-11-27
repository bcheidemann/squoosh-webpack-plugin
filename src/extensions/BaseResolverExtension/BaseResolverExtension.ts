import { resolve } from 'path';
import { Tokens } from '../../tokens';
import { RequestOptions, Extension, HookContext } from '../../types/extensions';
import { Match, match } from '../../utils/match';

export class BaseResolverExtension implements Extension {
  public name = 'BaseResolverExtension';
  public order = Number.MIN_SAFE_INTEGER; // Ensure this extension runs first

  public request(context: HookContext, options: RequestOptions) {
    // Request is excluded by default
    options.include = false;

    let request = options.request;

    // If request prefix is defined then validate if the request based on this
    if (context.options.requestPrefix) {
      if (request.startsWith(context.options.requestPrefix)) {
        // Include the request
        options.include = true;

        // Trim the prefix
        request = request.substr(context.options.requestPrefix.length);
      } else {
        // Hand over to next plugin
        return options;
      }
    }

    // Get the absolute path
    const absoluteRequestPath = resolve(options.context, request);

    // Validate if the request matches one of the dirs provided
    if (context.options.dirs) {
      const matched = context.options.dirs.some((dir) => {
        const detokenizedDir = dir.replace(Tokens.ROOT_DIR, process.cwd());
        absoluteRequestPath.startsWith(resolve(process.cwd(), detokenizedDir));
      });

      if (!matched) {
        // Exclude the request
        options.include = false;

        // Hand over to next plugin
        return options;
      }
    }

    // Validate if any of the include regexs pass
    if (context.options.include) {
      const matchAny = match(context.options.include, absoluteRequestPath, {
        match: Match.ANY,
      });
      if (!matchAny) {
        // Exclude the request
        options.include = false;

        // Hand over to next plugin
        return options;
      }
    }

    // Validate if any of the exclude regexs pass
    if (context.options.exclude) {
      const matchAny = match(context.options.exclude, absoluteRequestPath, {
        match: Match.ANY,
      });
      if (matchAny) {
        // Exclude the request
        options.include = false;

        // Hand over to next plugin
        return options;
      }
    }

    return options;
  }
}
