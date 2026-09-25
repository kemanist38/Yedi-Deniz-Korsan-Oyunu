import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import ts from 'typescript';

const code=ts.transpile(readFileSync(new URL('../src/special-ships.ts',import.meta.url),'utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022});
const S=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

test('special ships have unique ids, pearl prices and existing art',()=>{
  assert.equal(new Set(S.SPECIAL_SHIPS.map(s=>s.id)).size,S.SPECIAL_SHIPS.length);
  for(const s of S.SPECIAL_SHIPS){assert.ok(s.price>0,s.id);assert.ok(existsSync(new URL(`../public${s.art}`,import.meta.url)),s.art);}
  assert.equal(S.specialById('yok'),undefined);
});

test('special ship faces left by default and mirrors when heading right',()=>{
  assert.equal(S.specialFacing(-Math.PI/2,1),-1,'batı');
  assert.equal(S.specialFacing(Math.PI/2,-1),1,'doğu');
  assert.equal(S.specialFacing(Math.PI*.75,-1),1,'güneydoğu');
  assert.equal(S.specialFacing(0,1),1,'kuzeyde son bakış korunur');
  assert.equal(S.specialFacing(Math.PI,-1),-1,'güneyde son bakış korunur');
});
