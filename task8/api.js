async function request(path, method = 'GET', data = null) {
  const baseUrl = 'http://localhost:3001';
  const options = { method };

  if (data !== null) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(baseUrl + path, options);
    if (!response.ok) {
      throw new Error(`Сервер вернул ошибку ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Запрос не выполнен: ${error.message}. Запущен ли json-server?`);
  }
}

export function getTransactions() {
  return request('/transactions');
}

export function addTransaction(transaction) {
  return request('/transactions', 'POST', transaction);
}

export function updateTransaction(id, transaction) {
  return request(`/transactions/${id}`, 'PUT', transaction);
}

export function deleteTransaction(id) {
  return request(`/transactions/${id}`, 'DELETE');
}

export function getCategories() {
  return request('/categories');
}

export function addCategory(category) {
  return request('/categories', 'POST', category);
}
