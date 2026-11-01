// MODEL: хранит данные приложения и бизнес-логику (фильтрация, подсчёт, валидация).
// Ничего не знает про DOM.
import * as api from './api.js';

// Валидация операции. Возвращает объект ошибок (пустой — значит всё хорошо).
export function validateTransaction(data) {
  const errors = {};
  const amount = Number(data.amount);

  if (data.amount === '' || Number.isNaN(amount) || amount <= 0) {
    errors.amount = 'Введите положительное число';
  }
  if (!data.categoryId) {
    errors.categoryId = 'Выберите категорию';
  }
  if (!data.date) {
    errors.date = 'Укажите дату';
  }
  return errors;
}

// Валидация новой категории.
export function validateCategory(data) {
  const errors = {};
  if (!data.name.trim()) {
    errors.name = 'Введите название категории';
  }
  return errors;
}

export class Model {
  constructor() {
    this.transactions = [];
    this.categories = [];
    this.filter = { type: 'all', categoryId: '', from: '', to: '' };
  }

  // ---------- работа с сервером ----------
  async load() {
    this.transactions = await api.getTransactions();
    this.categories = await api.getCategories();
  }

  async addTransaction(data) {
    const created = await api.addTransaction(this.prepare(data));
    this.transactions.push(created);
  }

  async updateTransaction(id, data) {
    const updated = await api.updateTransaction(id, this.prepare(data));
    this.transactions = this.transactions.map((t) =>
      String(t.id) === String(id) ? updated : t
    );
  }

  async deleteTransaction(id) {
    await api.deleteTransaction(id);
    this.transactions = this.transactions.filter((t) => String(t.id) !== String(id));
  }

  async addCategory(data) {
    const created = await api.addCategory({ name: data.name.trim(), type: data.type });
    this.categories.push(created);
  }

  // Приводим данные формы к виду, который хранится на сервере.
  prepare(data) {
    return {
      type: data.type,
      amount: Number(data.amount),
      categoryId: String(data.categoryId),
      date: data.date,
      comment: data.comment,
    };
  }

  // ---------- чтение данных ----------
  getTransaction(id) {
    return this.transactions.find((t) => String(t.id) === String(id));
  }

  getCategoryName(id) {
    const category = this.categories.find((c) => String(c.id) === String(id));
    return category ? category.name : '—';
  }

  getCategoriesByType(type) {
    return this.categories.filter((c) => c.type === type);
  }

  setFilter(filter) {
    this.filter = { ...this.filter, ...filter };
  }

  getFilteredTransactions() {
    const { type, categoryId, from, to } = this.filter;

    return this.transactions
      .filter((t) => type === 'all' || t.type === type)
      .filter((t) => !categoryId || String(t.categoryId) === String(categoryId))
      .filter((t) => !from || t.date >= from)
      .filter((t) => !to || t.date <= to)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  // Сводка считается по ВСЕМ загруженным операциям (как в задании).
  getSummary() {
    let income = 0;
    let expense = 0;

    for (const t of this.transactions) {
      if (t.type === 'income') income += Number(t.amount);
      else expense += Number(t.amount);
    }
    return { income, expense, balance: income - expense };
  }
}
