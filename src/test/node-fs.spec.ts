import test from 'ava';
import { fromNodeLikeFileSystem, createGlobInterceptor, memoizeFileSystem } from '..';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

test('convertNodeLikeFileSystem', (t) => {
    t.deepEqual(
        glob.sync('**', {cwd: 'fixtures', nodir: true, ...createGlobInterceptor(fromNodeLikeFileSystem(fs))}),
        [
            'a/a.txt',
            'a/b/b.txt',
            'a/b/x/x.txt',
            'a/d/d.txt',
        ],
    );
});

test('memoize returns consistent results', (t) => {
    const interceptor = createGlobInterceptor(memoizeFileSystem(fromNodeLikeFileSystem(fs)));
    const expected = [
        'a/a.txt',
        'a/b/b.txt',
        'a/b/x/x.txt',
        'a/d/d.txt',
    ];
    t.deepEqual(
        glob.sync('**', {cwd: 'fixtures', nodir: true, ...interceptor}),
        expected,
    );
    t.deepEqual(
        glob.sync('**', {cwd: 'fixtures', nodir: true, ...interceptor}),
        expected,
    );

    t.deepEqual(
        glob.sync('**', {cwd: 'fixtures', nodir: true, dot: true, ...interceptor}),
        [
            'a/a.txt',
            'a/b/b.txt',
            'a/b/x/x.txt',
            'a/c/.gitkeep',
            'a/d/d.txt',
        ],
    );
    t.deepEqual(
        glob.sync('{**,*,*/**}', {cwd: 'fixtures', nodir: true, realpath: true, ...interceptor}),
        expected.map((p) => path.resolve('fixtures', p)),
    );
    t.deepEqual(
        glob.sync('{**,*,*/**}', {cwd: 'fixtures', nodir: true, realpath: true, ...interceptor}),
        expected.map((p) => path.resolve('fixtures', p)),
    );
});
