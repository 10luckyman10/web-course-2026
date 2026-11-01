// VIEW: отрисовка и работа с DOM. Данные не хранит и с сервером не общается.
export class View {
  constructor(doc) {
    this.doc = doc;
    this.root = doc.documentElement;
    this.form = doc.getElementById('transaction-form');
    this.categoryForm = doc.getElementById('category-form');
    this.filtersForm = doc.getElementById('filters');
    this.tbody = doc.getElementById('transactions-body');
    this.messageBox = doc.getElementById('message');
    this.themeButton = doc.getElementById('theme-btn');
    this.submitButton = doc.getElementById('submit-btn');
    this.cancelButton = doc.getElementById('cancel-btn');
    this.formTitle = doc.getElementById('form-title');
    this.resetFiltersButton = doc.getElementById('reset-filters-btn');
  }

  // ---------- подписки на события (передаём наружу обработчики контроллера) ----------
  bindTransactionSubmit(handler) {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      handler(this.getFormData());
    });
  }

  bindTypeChange(handler) {
    this.form.addEventListener('change', (e) => {
      if (e.target.name === 'type') handler(e.target.value);
    });
  }

  bindCancelEdit(handler) {
    this.cancelButton.addEventListener('click', handler);
  }

  bindCategorySubmit(handler) {
    this.categoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const elements = this.categoryForm.elements;
      handler({ name: elements.name.value, type: elements.type.value });
    });
  }

  bindFiltersChange(handler) {
    this.filtersForm.addEventListener('change', () => handler(this.getFilter()));
  }

  bindFiltersReset(handler) {
    this.resetFiltersButton.addEventListener('click', handler);
  }

  bindListClick(handler) {
    this.tbody.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-action]');
      if (button) handler(button.dataset.action, button.dataset.id);
    });
  }

  bindThemeToggle(handler) {
    this.themeButton.addEventListener('click', handler);
  }

  // ---------- чтение значений из форм ----------
  getFormData() {
    const f = this.form.elements;
    return {
      transactionId: f.transactionId.value,
      type: f.type.value,
      amount: f.amount.value,
      categoryId: f.categoryId.value,
      date: f.date.value,
      comment: f.comment.value.trim(),
    };
  }

  getFilter() {
    const f = this.filtersForm.elements;
    return {
      type: f.type.value,
      categoryId: f.categoryId.value,
      from: f.from.value,
      to: f.to.value,
    };
  }

  // ---------- отрисовка ----------
  renderSummary(summary) {
    this.doc.getElementById('sum-income').textContent = summary.income;
    this.doc.getElementById('sum-expense').textContent = summary.expense;
    this.doc.getElementById('sum-balance').textContent = summary.balance;
  }

  renderTransactions(transactions, getCategoryName) {
    this.tbody.replaceChildren();

    if (transactions.length === 0) {
      const row = this.doc.createElement('tr');
      row.append(this.createCell('Операций нет', '', 5));
      this.tbody.append(row);
      return;
    }

    for (const t of transactions) {
      const isIncome = t.type === 'income';
      const row = this.doc.createElement('tr');

      row.append(
        this.createCell(t.date),
        this.createCell(getCategoryName(t.categoryId)),
        this.createCell((isIncome ? '+' : '−') + t.amount, isIncome ? 'income' : 'expense'),
        this.createCell(t.comment || ''),
        this.createActionsCell(t.id)
      );
      this.tbody.append(row);
    }
  }

  createCell(text, className = '', colSpan = 1) {
    const cell = this.doc.createElement('td');
    cell.textContent = text; // textContent, чтобы в комментарий нельзя было вставить HTML
    cell.className = className;
    cell.colSpan = colSpan;
    return cell;
  }

  createActionsCell(id) {
    const cell = this.doc.createElement('td');
    const editBtn = this.createButton('Изменить', 'edit', id);
    const deleteBtn = this.createButton('Удалить', 'delete', id);
    cell.append(editBtn, ' ', deleteBtn);
    return cell;
  }

  createButton(text, action, id) {
    const button = this.doc.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.dataset.action = action;
    button.dataset.id = id;
    return button;
  }

  // Заполняет выпадающий список.
  fillSelect(select, items, selectedValue, emptyLabel = '') {
    select.replaceChildren();

    if (emptyLabel) {
      select.append(new Option(emptyLabel, ''));
    }
    for (const item of items) {
      select.append(new Option(item.name, item.id));
    }
    select.value = selectedValue ?? '';
  }

  renderFormCategories(categories, selectedId = '') {
    this.fillSelect(this.form.elements.categoryId, categories, String(selectedId), 'Выберите...');
  }

  renderFilterCategories(categories, selectedId = '') {
    this.fillSelect(this.filtersForm.elements.categoryId, categories, String(selectedId), 'Все категории');
  }

  setFilter(filter) {
    const f = this.filtersForm.elements;
    f.type.value = filter.type;
    f.categoryId.value = filter.categoryId;
    f.from.value = filter.from;
    f.to.value = filter.to;
  }

  setTheme(theme) {
    this.root.dataset.theme = theme;
  }

  // ---------- режимы формы ----------
  fillFormForEdit(transaction) {
    const f = this.form.elements;
    f.transactionId.value = transaction.id;
    f.type.value = transaction.type;
    f.amount.value = transaction.amount;
    f.date.value = transaction.date;
    f.comment.value = transaction.comment || '';

    this.formTitle.textContent = 'Редактирование операции';
    this.submitButton.textContent = 'Сохранить';
    this.cancelButton.hidden = false;
  }

  resetForm() {
    this.form.reset();
    this.form.elements.transactionId.value = '';
    this.form.elements.date.value = new Date().toISOString().slice(0, 10);

    this.formTitle.textContent = 'Новая операция';
    this.submitButton.textContent = 'Добавить';
    this.cancelButton.hidden = true;
    this.clearErrors(this.form);
  }

  resetCategoryForm() {
    this.categoryForm.reset();
    this.clearErrors(this.categoryForm);
  }

  // ---------- ошибки ----------
  showErrors(form, errors) {
    this.clearErrors(form);

    for (const [field, text] of Object.entries(errors)) {
      form.elements[field].classList.add('invalid');
      form.querySelector(`[data-error-for="${field}"]`).textContent = text;
    }
  }

  clearErrors(form) {
    for (const input of form.querySelectorAll('.invalid')) {
      input.classList.remove('invalid');
    }
    for (const span of form.querySelectorAll('.error')) {
      span.textContent = '';
    }
  }

  showMessage(text) {
    this.messageBox.textContent = text;
    this.messageBox.hidden = text === '';
  }
}
