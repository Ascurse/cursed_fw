import { afterEach, expect, test } from 'vitest';

import * as runtime from '../index.js';
import { createApp, h } from '../index.js';

const mountedParents = [];

const INCREMENT_PAYLOAD = 2;

function createParent() {
    const parent = document.createElement('div');
    document.body.append(parent);
    mountedParents.push(parent);

    return parent;
}

// Счётчик, собранный только из публичной поверхности: view получает state и emit,
// reducer превращает предыдущее состояние и полезную нагрузку в следующее.
function createCounterApp(initialCount = 0) {
    return createApp({
        state: { count: initialCount },
        view: (state, emit) => h('button', {
            on: {
                click: () => emit('increment', INCREMENT_PAYLOAD),
            },
        }, [String(state.count)]),
        reducers: {
            increment: (state, payload) => ({ count: state.count + payload }),
        },
    });
}

afterEach(() => {
    mountedParents.splice(0).forEach((parent) => parent.remove());
});

test('publishes exactly the documented export surface', () => {
    expect(Object.keys(runtime).sort()).toEqual(['createApp', 'h', 'hFragment', 'hString']);
});

test('renders the initial state when the application mounts', () => {
    const parent = createParent();

    createCounterApp(7).mount(parent);

    expect(parent.textContent).toBe('7');
});

test('re-renders with the next state when the view emits a command', () => {
    const parent = createParent();
    createCounterApp(0).mount(parent);

    parent.querySelector('button').click();

    expect(parent.textContent).toBe(String(INCREMENT_PAYLOAD));
});

test('hands the reducer the previous state and the emitted payload', () => {
    const parent = createParent();
    const reducerCalls = [];

    createApp({
        state: { count: 4 },
        view: (state, emit) => h('button', {
            on: {
                click: () => emit('add', 3),
            },
        }, [String(state.count)]),
        reducers: {
            add: (state, payload) => {
                reducerCalls.push([state, payload]);

                return { count: state.count + payload };
            },
        },
    }).mount(parent);

    parent.querySelector('button').click();

    expect(reducerCalls).toEqual([[{ count: 4 }, 3]]);
});

test('keeps application instances isolated from each other', () => {
    const firstParent = createParent();
    const secondParent = createParent();
    createCounterApp(0).mount(firstParent);
    createCounterApp(0).mount(secondParent);

    firstParent.querySelector('button').click();

    expect(firstParent.textContent).toBe(String(INCREMENT_PAYLOAD));
    expect(secondParent.textContent).toBe('0');
});

test('removes its rendered DOM when the instance unmounts', () => {
    const parent = createParent();
    const app = createCounterApp();
    app.mount(parent);

    app.unmount();

    expect(parent.childNodes).toHaveLength(0);
});
