// CONTROLLER: связывает Model и View, обрабатывает действия пользователя.
import { Model, validateTransaction, validateCategory } from './model.js';
import { View } from './ui.js';
import { SettingsStorage } from './settings.js';

class Controller {
  constructor(model, view, settingsStorage) {
    this.model = model;
    this.view = view;
    this.settingsStorage = settingsStorage;
    this.settings = settingsStorage.load(); // тема и фильтр
  }

  async init() {
    this.view.setTheme(this.settings.theme);
    this.model.setFilter(this.settings.filter);
    this.bindEvents();
    this.view.resetForm();

    try {
      await this.model.load();
      this.view.showMessage('');
    } catch (error) {
      this.view.showMessage(error.message);
    }

    this.renderCategories();
    this.view.setFilter(this.model.filter); // восстанавливаем фильтр после перезагрузки
    this.render();
  }

  bindEvents() {
    this.view.bindTransactionSubmit((data) => this.handleTransactionSubmit(data));
    this.view.bindTypeChange((type) => this.view.renderFormCategories(this.model.getCategoriesByType(type)));
    this.view.bindCancelEdit(() => this.resetTransactionForm());
    this.view.bindCategorySubmit((data) => this.handleCategorySubmit(data));
    this.view.bindFiltersChange((filter) => this.handleFilterChange(filter));
    this.view.bindFiltersReset(() => this.handleFilterChange({ type: 'all', categoryId: '', from: '', to: '' }, true));
    this.view.bindListClick((action, id) => this.handleListClick(action, id));
    this.view.bindThemeToggle(() => this.handleThemeToggle());
  }

  // ---------- отрисовка ----------
  render() {
    this.view.renderSummary(this.model.getSummary());
    this.view.renderTransactions(
      this.model.getFilteredTransactions(),
      (id) => this.model.getCategoryName(id)
    );
  }

  renderCategories(selectedCategoryId = '') {
    const type = this.view.getFormData().type;
    this.view.renderFormCategories(this.model.getCategoriesByType(type), selectedCategoryId);
    this.view.renderFilterCategories(this.model.categories, this.model.filter.categoryId);
  }

  resetTransactionForm() {
    this.view.resetForm();
    this.renderCategories();
  }

  // ---------- обработчики ----------
  async handleTransactionSubmit(data) {
    const errors = validateTransaction(data);
    if (Object.keys(errors).length > 0) {
      this.view.showErrors(this.view.form, errors);
      return;
    }

    try {
      if (data.transactionId) {
        await this.model.updateTransaction(data.transactionId, data);
      } else {
        await this.model.addTransaction(data);
      }
      this.view.showMessage('');
      this.resetTransactionForm();
      this.render();
    } catch (error) {
      this.view.showMessage(error.message);
    }
  }

  async handleCategorySubmit(data) {
    const errors = validateCategory(data);
    if (Object.keys(errors).length > 0) {
      this.view.showErrors(this.view.categoryForm, errors);
      return;
    }

    try {
      await this.model.addCategory(data);
      this.view.showMessage('');
      this.view.resetCategoryForm();
      this.renderCategories(this.view.getFormData().categoryId);
    } catch (error) {
      this.view.showMessage(error.message);
    }
  }

  async handleListClick(action, id) {
    if (action === 'edit') {
      const transaction = this.model.getTransaction(id);
      this.view.fillFormForEdit(transaction);
      this.renderCategories(transaction.categoryId);
      return;
    }

    if (action === 'delete') {
      try {
        await this.model.deleteTransaction(id);
        this.view.showMessage('');
        this.render();
      } catch (error) {
        this.view.showMessage(error.message);
      }
    }
  }

  handleFilterChange(filter, updateForm = false) {
    this.model.setFilter(filter);
    if (updateForm) this.view.setFilter(this.model.filter);

    this.settings.filter = this.model.filter;
    this.settingsStorage.save(this.settings);
    this.render();
  }

  handleThemeToggle() {
    this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
    this.view.setTheme(this.settings.theme);
    this.settingsStorage.save(this.settings);
  }
}

// Точка входа: собираем слои вместе (все объекты живут внутри функции, не в глобальной области).
function start() {
  const model = new Model();
  const view = new View(document);
  const settingsStorage = new SettingsStorage(localStorage);
  new Controller(model, view, settingsStorage).init();
}

start();
