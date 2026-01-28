class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.draggedItem = null;
        this.init();
    }

    init() {
        this.createAppStructure();
        this.renderTasks();
        this.bindEvents();
    }

    createAppStructure() {
        const app = document.getElementById('app');
        const container = this.createElement('div', { className: 'container' });
        
        const header = this.createElement('header', { className: 'header' });
        const title = this.createElement('h1', { textContent: 'To-Do List' });
        header.appendChild(title);
        header.appendChild(this.createAddTaskForm());
        
        const controls = this.createElement('nav', { className: 'controls' });
        controls.appendChild(this.createSearchBox());
        controls.appendChild(this.createFilterButtons());
        
        const main = this.createElement('main', { className: 'tasks-container' });
        const section = this.createElement('section', { className: 'task-section' });
        this.taskList = this.createElement('ul', { className: 'task-list' });
        section.appendChild(this.taskList);
        main.appendChild(section);
        
        container.appendChild(header);
        container.appendChild(controls);
        container.appendChild(main);
        app.appendChild(container);
    }

    createAddTaskForm() {
        const form = this.createElement('form', { className: 'add-task-form' });
        const inputsRow = this.createElement('div', { className: 'form-inputs-row' });
        
        const taskLabel = this.createElement('label', { 
            className: 'form-label',
            textContent: 'Название задачи'
        });
        const taskInput = this.createElement('input', {
            type: 'text',
            placeholder: 'Введите задачу...',
            className: 'form-input',
            'aria-label': 'Название задачи'
        });
        
        const taskGroup = this.createElement('div', { className: 'form-group' });
        taskGroup.appendChild(taskLabel);
        taskGroup.appendChild(taskInput);
        
        const dateLabel = this.createElement('label', { 
            className: 'form-label',
            textContent: 'Дата'
        });
        const dateInput = this.createElement('input', {
            type: 'date',
            className: 'form-input',
            'aria-label': 'Дата задачи'
        });
        
        const dateGroup = this.createElement('div', { className: 'form-group' });
        dateGroup.appendChild(dateLabel);
        dateGroup.appendChild(dateInput);
        
        inputsRow.appendChild(taskGroup);
        inputsRow.appendChild(dateGroup);
        
        const addButton = this.createElement('button', {
            type: 'submit',
            className: 'btn btn-primary',
            textContent: 'Добавить'
        });
        
        form.appendChild(inputsRow);
        form.appendChild(addButton);
        dateInput.valueAsDate = new Date();
        
        return form;
    }

    createSearchBox() {
        const searchBox = this.createElement('div', { className: 'search-box' });
        const searchLabel = this.createElement('label', { 
            className: 'sr-only',
            textContent: 'Поиск задач'
        });
        this.searchInput = this.createElement('input', {
            type: 'text',
            placeholder: 'Поиск задач...',
            'aria-label': 'Поиск задач'
        });
        searchBox.appendChild(searchLabel);
        searchBox.appendChild(this.searchInput);
        return searchBox;
    }

    createFilterButtons() {
        const filterContainer = this.createElement('div', { className: 'filter-buttons' });
        const filterLabel = this.createElement('span', { 
            className: 'filter-label',
            textContent: 'Фильтр:'
        });
        filterContainer.appendChild(filterLabel);
        
        const filters = [
            { value: 'all', text: 'Все' },
            { value: 'active', text: 'Активные' },
            { value: 'completed', text: 'Выполненные' }
        ];
        
        filters.forEach(filter => {
            const button = this.createElement('button', {
                type: 'button',
                className: `btn btn-filter ${filter.value === 'all' ? 'active' : ''}`,
                textContent: filter.text,
                'data-filter': filter.value,
                'aria-pressed': filter.value === 'all' ? 'true' : 'false'
            });
            filterContainer.appendChild(button);
        });
        
        return filterContainer;
    }

    createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'textContent') {
                element.textContent = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        return element;
    }

    bindEvents() {
        // Добавление задачи
        document.querySelector('.add-task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Поиск
        this.searchInput.addEventListener('input', () => {
            this.renderTasks();
        });

        // Фильтрация
        document.querySelectorAll('.btn-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-filter').forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                e.target.classList.add('active');
                e.target.setAttribute('aria-pressed', 'true');
                this.currentFilter = e.target.dataset.filter;
                this.renderTasks();
            });
        });

        // Drag and drop события
        this.taskList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-item')) {
                this.draggedItem = e.target;
                e.target.classList.add('dragging');
            }
        });

        this.taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(this.taskList, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (draggable && afterElement) {
                this.taskList.insertBefore(draggable, afterElement);
            }
        });

        this.taskList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.remove('dragging');
                this.updateTaskOrder();
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    addTask() {
        const form = document.querySelector('.add-task-form');
        const taskInputs = form.querySelectorAll('input[type="text"]');
        const dateInputs = form.querySelectorAll('input[type="date"]');
        
        const taskInput = taskInputs[taskInputs.length - 1];
        const dateInput = dateInputs[dateInputs.length - 1];
        
        const text = taskInput.value.trim();
        const date = dateInput.value;
        
        if (!text) {
            taskInput.focus();
            return;
        }
        
        const task = {
            id: Date.now(),
            text: text,
            date: date,
            completed: false,
            order: this.tasks.length
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        
        taskInput.value = '';
        dateInput.valueAsDate = new Date();
        taskInput.focus();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    editTask(id, newText, newDate) {
        const task = this.tasks.find(task => task.id === id);
        if (task && newText.trim()) {
            task.text = newText.trim();
            task.date = newDate;
            this.saveTasks();
            this.renderTasks();
        }
    }

    updateTaskOrder() {
        const taskElements = this.taskList.querySelectorAll('.task-item');
        const newOrder = [];
        
        taskElements.forEach((element, index) => {
            const id = parseInt(element.dataset.id);
            const task = this.tasks.find(task => task.id === id);
            if (task) {
                task.order = index;
                newOrder.push(task);
            }
        });
        
        this.tasks = newOrder;
        this.saveTasks();
    }

    createTaskElement(task) {
        const taskItem = this.createElement('li', {
            className: `task-item ${task.completed ? 'completed' : ''}`,
            'data-id': task.id, draggable: 'true',
            'role': 'listitem'
        });
        
        const checkbox = this.createElement('input', {
            type: 'checkbox',
            className: 'task-checkbox',
            'aria-label': `Отметить задачу как ${task.completed ? 'невыполненную' : 'выполненную'}: ${task.text}`
        });
        checkbox.checked = task.completed;
        
        const taskContent = this.createElement('div', { className: 'task-content' });
        const taskText = this.createElement('span', {
            className: `task-text ${task.completed ? 'completed' : ''}`,
            textContent: task.text
        });
        const taskDate = this.createElement('time', {
            className: 'task-date',
            textContent: this.formatDate(task.date),
            dateTime: task.date
        });
        
        taskContent.appendChild(taskText);
        taskContent.appendChild(taskDate);
        
        const taskActions = this.createElement('div', { className: 'task-actions' });
        const editButton = this.createElement('button', {
            className: 'btn-edit',
            textContent: 'Редактировать',
            'aria-label': `Редактировать задачу: ${task.text}`
        });
        const deleteButton = this.createElement('button', {
            className: 'btn-delete',
            textContent: 'Удалить',
            'aria-label': `Удалить задачу: ${task.text}`
        });
        
        taskActions.appendChild(editButton);
        taskActions.appendChild(deleteButton);
        
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskContent);
        taskItem.appendChild(taskActions);
        
        checkbox.addEventListener('change', () => this.toggleTask(task.id));
        deleteButton.addEventListener('click', () => this.deleteTask(task.id));
        editButton.addEventListener('click', () => this.startEditTask(taskItem, task));
        
        return taskItem;
    }
    startEditTask(taskElement, task) {
        const taskContent = taskElement.querySelector('.task-content');
        const currentText = task.text;
        const currentDate = task.date;
        
        const editForm = this.createElement('form', { className: 'edit-form' });
        const textInput = this.createElement('input', {
            type: 'text',
            className: 'edit-input',
            value: currentText,
            'aria-label': 'Текст задачи'
        });
        const dateInput = this.createElement('input', {
            type: 'date',
            className: 'edit-date',
            value: currentDate,
            'aria-label': 'Дата задачи'
        });
        const saveButton = this.createElement('button', {
            className: 'save-btn',
            textContent: 'Сохранить',
            type: 'submit'
        });
        const cancelButton = this.createElement('button', {
            className: 'cancel-btn',
            textContent: 'Отмена',
            type: 'button'
        });
        editForm.appendChild(textInput);
        editForm.appendChild(dateInput);
        editForm.appendChild(saveButton);

        editForm.appendChild(cancelButton);
        
        taskElement.replaceChild(editForm, taskContent);
        textInput.focus();
        
        const saveEdit = () => {
            this.editTask(task.id, textInput.value, dateInput.value);
        };
        
        const cancelEdit = () => {
            this.renderTasks();
        };
        
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveEdit();
        });
        
        cancelButton.addEventListener('click', cancelEdit);
        
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') cancelEdit();
        });
        
        dateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') cancelEdit();
        });
    }
    renderTasks() {
        while (this.taskList.firstChild) {
            this.taskList.removeChild(this.taskList.firstChild);
        }
        
        let filteredTasks = this.tasks;
        
        const searchTerm = this.searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.text.toLowerCase().includes(searchTerm)
            );
        }
        
        switch (this.currentFilter) {
            case 'active':
                filteredTasks = filteredTasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = filteredTasks.filter(task => task.completed);
                break;
        }
        
        // Сортировка по дате, затем по порядку drag-and-drop
        filteredTasks.sort((a, b) => {
            const dateCompare = new Date(a.date) - new Date(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.order - b.order;
        });
        
        if (filteredTasks.length === 0) {
            const emptyState = this.createElement('article', { className: 'empty-state' });
            
            const emptyTitle = this.createElement('h2', { 
                textContent: 'Задачи не найдены' 
            });
            
            const emptyText = this.createElement('p', {
                textContent: this.tasks.length === 0 ? 
                    'Добавьте первую задачу!' : 
                    'Попробуйте изменить фильтр или поисковый запрос'
            });
            
            emptyState.appendChild(emptyTitle);
            emptyState.appendChild(emptyText);
            this.taskList.appendChild(emptyState);
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.taskList.appendChild(taskElement);
        });
    }
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }
    loadTasks() {
        const saved = localStorage.getItem('todoTasks');
        return saved ? JSON.parse(saved) : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});