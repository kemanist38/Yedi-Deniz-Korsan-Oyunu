import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const code=ts.transpile(readFileSync(new URL('../src/elite-ships.ts',import.meta.url),'utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022});
const E=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const MIRROR={N:'N',NE:'NW',E:'W',SE:'SW',S:'S',SW:'SE',W:'E',NW:'NE'};

test('every elite ship shows the travelled direction in all eight headings',()=>{
  for(const ship of E.ELITE_SHIPS){const shows=(E.ELITE_DIR_SHOWS[ship.id]??'S SW W NE N SE E NW').split(' ');
    assert.equal(shows.length,8,ship.id);
    for(let c=0;c<8;c++){const {frame,mirror}=E.eliteDirFrame(ship.id,c),seen=mirror?MIRROR[shows[frame]]:shows[frame];
      assert.equal(seen,E.COMPASS[c],`${ship.id} ${E.COMPASS[c]} → kare ${frame}${mirror?' (ayna)':''}`);}}
});

test('correct sheets keep their original frames without mirroring',()=>{
  const map=[4,3,6,5,0,1,2,7];
  for(let c=0;c<8;c++)assert.deepEqual(E.eliteDirFrame('magma',c),{frame:map[c],mirror:false});
  assert.deepEqual(E.eliteDirFrame('plague',7),{frame:3,mirror:true},'kuzeybatı = aynalanmış kuzeydoğu');
});
