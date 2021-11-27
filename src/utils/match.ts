export enum Match {
  NONE,
  ANY,
  ALL,
}

type MatchOptions = {
  match: Match;
};

export function match(
  regex: RegExp | Array<RegExp>,
  string: string,
  options: MatchOptions = { match: Match.ANY }
) {
  if (Array.isArray(regex)) {
    switch (options.match) {
      case Match.NONE:
        return regex.every((regex) => !regex.test(string));
      case Match.ANY:
        return regex.some((regex) => regex.test(string));
      case Match.ALL:
        return regex.every((regex) => regex.test(string));
      default:
        throw new Error('Invalid option: options.match');
    }
  } else {
    const isMatch = regex.test(string);
    switch (options.match) {
      case Match.NONE:
        return !isMatch;
      case Match.ANY:
      case Match.ALL:
        return isMatch;
      default:
        throw new Error('Invalid option: options.match');
    }
  }
}
