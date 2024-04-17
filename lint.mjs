/*
 * This script runs markdownlint for all md filed in `posts` and `drafts` dirs.
 *
 * All errors will be logged.
 *
 * Any error found in `posts` files will result in non-zero exit code.
 * Errors found `drafts` files will just be logged.
 */

import { globSync } from 'glob';
import markdownlint from 'markdownlint';

const config = markdownlint.readConfigSync('.markdownlint.json');

const files = globSync([
  'posts/*.md',
  'drafts/*.md',
]);

/** @type {markdownlint.Options} */
const options = {
  config,
  files,
};

console.log('Linting markdown files in posts and drafts ...\n');

const results = markdownlint.sync(options);

let postsErrorCount = 0;
let draftsErrorCount = 0;

for (const fileName in results) {
  const result = results[fileName];
  if (result.length === 0) {
    // no errors
    console.log(`✔️ ${fileName} - ok`);
    continue;
  }

  // there were some errors... count and log them
  for (const err of result) {
    const isDraft = fileName.startsWith('drafts/');
    let symbol = '❌';
    if (isDraft) {
      draftsErrorCount++;
      symbol = '🚧';
    } else {
      postsErrorCount++;
    }

    console.log(`${symbol} ${fileName}:${err.lineNumber} - ${err.ruleNames.join('/')} ${err.ruleDescription} [${err.errorDetail}]`);
  }
}

console.log('\n──────────');

if (postsErrorCount === 0 && draftsErrorCount === 0) {
  console.log('All fine. 👍️');
} else {
  if (postsErrorCount > 0) {
    console.log(`❌ ${postsErrorCount} error${postsErrorCount > 1 ? 's' : ''} found in posts`);
  }
  if (draftsErrorCount > 0) {
    console.log(`🚧 ${draftsErrorCount} error${draftsErrorCount > 1 ? 's' : ''} found in drafts`);
  }
}

console.log('──────────');

if (postsErrorCount > 0) {
  process.exitCode = 1;
}
