import { expect, test } from 'vitest';

import { h, hFragment, hString } from '../index.js';

test('public VNode helpers preserve node kind and child order', () => {
    const first = hString('first');
    const second = h('strong', {}, ['second']);

    expect(hFragment([first, second])).toEqual({
        type: 'fragment',
        children: [
            { type: 'text', value: 'first' },
            {
                type: 'element',
                tag: 'strong',
                props: {},
                children: [{ type: 'text', value: 'second' }],
            },
        ],
    });
});
