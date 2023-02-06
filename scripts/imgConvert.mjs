// Copyright 2017-2023 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import path from 'node:path';

import { zlibSync } from 'fflate/node';

import { stringCamelCase } from '@polkadot/util';

const WITH_ZLIB = false;

const DIRS = ['extensions', 'external', 'chains', 'nodes'];

const MIME = {
  gif: 'image/gif',
  png: 'image/png',
  svg: 'image/svg+xml'
}

for (let dir of DIRS) {
  const sub = path.join('packages/apps-config/src/ui/logos', dir);
  const result = {};

  fs
    .readdirSync(sub)
    .forEach((file) => {
      const full = path.join(sub, file);

      if (file !== 'index.ts' && fs.lstatSync(full).isFile()) {
        const parts = file.split('.');
        const ext = parts[parts.length - 1];
        const mime = MIME[ext];

        if (!mime) {
          console.error(`Unable to determine mime for ${f}`);
        } else {
          const data = `data:${mime};base64,${fs.readFileSync(full).toString('base64')}`;
          const compressed = Buffer.from(zlibSync(Buffer.from(data), { level: 9 }));
          const base64 = compressed.toString('base64');

          result[`${stringCamelCase(`${dir}_${parts.slice(0, parts.length - 1).join('_')}`)}${ext.toUpperCase()}`] = WITH_ZLIB
            ? `unz(';base64,${base64}', ${compressed.length}, ${data.length})`
            : `'${data}'`;
        }
      }
    });

    if (Object.keys(result).length) {
      fs.writeFileSync(path.join(sub, 'index.ts'), `// Copyright 2017-2023 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

// do not edit
// auto-generated by scripts/imgConvert.mjs
${
  WITH_ZLIB
    ? "\nimport { unz } from '../../../util';\n"
    : ''
}
${Object.keys(result).sort().map((k) => `export const ${k} = ${result[k]};`).join('\n')}
`);
    }
}

