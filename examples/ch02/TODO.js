const TODO = ["Walk the dog", "Buy groceries", "Finish the project"];

const addTodoInput = document.getElementById("todo-input");
const addTodoBtn = document.getElementById("add-todo-btn");
const TODOList = document.getElementById("TODO-list");

for (const todo of TODO) {
    TODOList.append(renderTodoInReadMore(todo));
}

addTodoInput.addEventListener("input", () => {
    addTodoBtn.disabled = addTodoInput.value.length < 3;
});

addTodoInput.addEventListener('keydown', ({key}) => {
    if (key === 'Enter' && addTodoInput.value.length > 3) {
        addTodo();
    }
})

addTodoBtn.addEventListener('click', () => {
    addTodo();
})


function renderTodoInReadMore(todo) {
    const li = document.createElement("li");
    li.textContent = todo;
    return li;
}

function addTodo() {
    const newTodo = addTodoInput.value;
    TODO.push(newTodo);
    TODOList.append(renderTodoInReadMore(newTodo));
    addTodoInput.value = "";
    addTodoBtn.disabled = true;
}