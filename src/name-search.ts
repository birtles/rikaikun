import Bugsnag from '@bugsnag/browser';
import { NameResult, getNames } from '@birchill/hikibiki-data';
import { expandChoon, kyuujitaiToShinjitai } from '@birchill/normal-jp';

import { NameSearchResult } from './search-result';
import { endsInYoon } from './yoon';

export async function nameSearch({
  input,
  inputLengths,
  minInputLength,
  maxResults,
}: {
  input: string;
  inputLengths: Array<number>;
  minInputLength?: number;
  maxResults: number;
}): Promise<NameSearchResult | null> {
  let result: NameSearchResult = {
    type: 'names',
    data: [],
    more: false,
    matchLen: 0,
  };

  // Record the position of existing entries for grouping purposes
  let existingItems = new Map<string, number>();

  let currentString = input;

  while (currentString.length > 0) {
    const currentInputLength = inputLengths[currentString.length];
    if (minInputLength && minInputLength > currentInputLength) {
      break;
    }

    // Expand ー to its various possibilities
    const variations = [currentString, ...expandChoon(currentString)];

    // See if there are any 旧字体 we can convert to 新字体
    const toNew = kyuujitaiToShinjitai(currentString);
    if (toNew !== currentString) {
      variations.push(toNew);
    }

    for (const variant of variations) {
      let names: Array<NameResult>;
      try {
        names = await getNames(variant);
      } catch (e) {
        console.error(e);
        Bugsnag.notify(e || '(Error looking up names)');
        return null;
      }

      if (!names.length) {
        continue;
      }

      result.matchLen = Math.max(result.matchLen, currentInputLength);

      for (const name of names) {
        // We group together entries where the kana readings and translation
        // details are all equal.
        const nameContents = getNameEntryHash(name);

        // Check for an existing entry to combine with
        const existingIndex = existingItems.get(nameContents);
        if (typeof existingIndex !== 'undefined') {
          const existingEntry = result.data[existingIndex];
          if (name.k) {
            if (!existingEntry.k) {
              existingEntry.k = [];
            }
            existingEntry.k.push(...name.k);
          }
        } else {
          result.data.push({ ...name, matchLen: currentInputLength });
          existingItems.set(nameContents, result.data.length - 1);
        }

        if (result.data.length >= maxResults) {
          return result;
        }
      }

      // Unlike word searching, we don't restrict subsequent searches to this
      // variant since if we get a search for オーサカ we want to return matches
      // for _both_ おうさか and おおさか and name entries.
    }

    // Shorten input, but don't split a ようおん (e.g. きゃ).
    const lengthToShorten = endsInYoon(currentString) ? 2 : 1;
    currentString = currentString.substr(
      0,
      currentString.length - lengthToShorten
    );
  }

  if (!result.data.length) {
    return null;
  }

  return result;
}

function getNameEntryHash(name: NameResult): string {
  return (
    name.r.join('-') +
    '#' +
    name.tr
      .map(
        (tr) =>
          `${(tr.type || []).join(',')}-${tr.det.join(',')}${
            tr.cf ? '-' + tr.cf.join(',') : ''
          }`
      )
      .join(';')
  );
}
