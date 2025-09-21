#!/usr/bin/bash

#source: https://medium.com/@gabrieldrouin/node-js-2025-guide-how-to-setup-express-js-with-typescript-eslint-and-prettier-b342cd21c30d

#npm init -y
#npx tsc --init
npm i express
npm i -D typescript @types/node @types/express @tsconfig/node22
npm i -D tsx
npm i -D prettier
npm i -D eslint typescript-eslint @eslint/js eslint-plugin-perfectionist
npm i -D vitest @vitest/coverage-v8 @vitest/eslint-plugin
npm install --save-dev nodemon
npm install --save-dev ts-node typescript
npm install express-ejs-layouts
npm install --save-dev @eslint/eslintrc
npm install --save-dev @typescript-eslint/parser
npm i -D husky lint-staged
#npx husky init