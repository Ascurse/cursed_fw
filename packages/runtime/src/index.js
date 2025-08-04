import { h, hFragment } from "./h";

const app = hFragment([
    h('h1', {class: 'title'}, ['My counter']),
    h('div', {class: 'container'}, [
        h('button', {}, ['Decrement']),
        h('span', {}, ['0']),
        h('button', {}, ['Increment'])
    ])
])

console.log(app)