const TODO = ["Walk the dog", "Buy groceries", "Finish the project"];

const addTodoInput = document.getElementById("todo-input");
const addTodoBtn = document.getElementById("add-todo-btn");
const TODOList = document.getElementById("TODO-list");

for (const todo of TODO) {
    TODOList.append(renderTodoInReadMode(todo));
}

addTodoInput.addEventListener("input", () => {
    addTodoBtn.disabled = addTodoInput.value.length < 3;
});

addTodoInput.addEventListener('keydown', ({ key }) => {
    if (key === 'Enter' && addTodoInput.value.length > 3) {
        addTodo();
    }
})

addTodoBtn.addEventListener('click', () => {
    addTodo();
})


function renderTodoInReadMode(todo) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = todo;
    span.addEventListener('dblclick', () => {
        const idx = TODO.indexOf(todo);

        TODOList.replaceChild(
            renderTodoInEditMode(todo),
            TODOList.childNodes[idx]
        )
    })
    li.append(span);

    const button = document.createElement("button");
    button.textContent = 'Done'
    button.addEventListener('click', () => {
        const idx = TODO.indexOf(todo);
        removeTodo(idx);
    })
    li.append(button);
    return li;
}

function renderTodoInEditMode(todo) {
    const li = document.createElement("li");

    const input = document.createElement("input");
    input.type = "text";
    input.value = todo;
    li.append(input);

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", () => {
        const idx = TODO.indexOf(todo);
        updateTodo(idx, input.value);
    })
    li.append(saveBtn);

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => {
        const idx = TODO.indexOf(todo);
        TODOList.replaceChild(
            renderTodoInReadMode(todo),
            TODOList.childNodes[idx]
        )
    })
    li.append(cancelBtn);

    return li;
}

function addTodo() {
    const newTodo = addTodoInput.value;
    TODO.push(newTodo);
    TODOList.append(renderTodoInReadMode(newTodo));
    addTodoInput.value = "";
    addTodoBtn.disabled = true;
}

function removeTodo(index) {
    TODO.splice(index, 1);
    TODOList.childNodes[index].remove();
}

function updateTodo(index, newTodo) {
    TODO[index] = newTodo;
    const todo = renderTodoInReadMode(newTodo);
    TODOList.replaceChild(
        todo,
        TODOList.childNodes[index]
    )
}