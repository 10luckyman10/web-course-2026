// Хранилище ПОЛЬЗОВАТЕЛЬСКИХ НАСТРОЕК в localStorage (операции здесь не хранятся!).
export class SettingsStorage {
  constructor(storage) {
    this.storage = storage;
    this.key = 'zen-money-settings';
  }

  getDefaults() {
    return {
      theme: 'light',
      filter: { type: 'all', categoryId: '', from: '', to: '' },
    };
  }

  load() {
    try {
      const saved = JSON.parse(this.storage.getItem(this.key));
      return { ...this.getDefaults(), ...saved };
    } catch (error) {
      return this.getDefaults();
    }
  }

  save(settings) {
    try {
      this.storage.setItem(this.key, JSON.stringify(settings));
    } catch (error) {
      console.warn('Не удалось сохранить настройки', error);
    }
  }
}
