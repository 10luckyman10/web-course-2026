(function () {
    'use strict';

    class PostsModel {
        constructor() {
            this.apiUrl = 'https://jsonplaceholder.typicode.com/posts';
            this.limit = 10;
            this.total = 100;

            this.posts = [];
            this.page = 1;
            this.searchText = '';
            this.isLoading = false;
            this.hasMore = true;
            this.hasError = false;
            this.errorMessage = '';
        }

        canLoad() {
            return !this.isLoading && this.hasMore && !this.hasError;
        }

        async loadNextPage() {
            this.isLoading = true;
            try {
                const response = await fetch(`${this.apiUrl}?_page=${this.page}&_limit=${this.limit}`);
                if (!response.ok) {
                    throw new Error(`Сервер вернул ошибку ${response.status}`);
                }
                const newPosts = await response.json();

                this.posts = this.posts.concat(newPosts);
                this.page++;

                if (newPosts.length < this.limit || this.posts.length >= this.total) {
                    this.hasMore = false;
                }
            } catch (error) {
                this.hasError = true;
                this.errorMessage =
                    'Не удалось загрузить посты. Проверьте подключение к интернету. (' + error.message + ')';
            } finally {
                this.isLoading = false;
            }
        }

        resetError() {
            this.hasError = false;
            this.errorMessage = '';
        }

        setSearchText(text) {
            this.searchText = text.trim();
        }

        getFilteredPosts() {
            const query = this.searchText.toLowerCase();
            return this.posts.filter(post => post.title.toLowerCase().includes(query));
        }
    }

    class PostsView {
        constructor() {
            this.postsEl = document.getElementById('posts');
            this.searchEl = document.getElementById('search');
            this.loaderEl = document.getElementById('loader');
            this.errorEl = document.getElementById('error');
            this.errorTextEl = document.getElementById('error-text');
            this.retryEl = document.getElementById('retry');
            this.endEl = document.getElementById('end');
            this.emptyEl = document.getElementById('empty');
        }

        renderPosts(posts) {
            this.postsEl.innerHTML = '';

            posts.forEach(post => {
                const card = document.createElement('div');
                card.className = 'card';

                const title = document.createElement('h2');
                title.textContent = post.title;

                const body = document.createElement('p');
                body.textContent = post.body;

                const author = document.createElement('span');
                author.className = 'author';
                author.textContent = 'Автор (userId): ' + post.userId;

                card.append(title, body, author);
                this.postsEl.appendChild(card);
            });
        }

        showLoader(visible) {
            this.loaderEl.hidden = !visible;
        }

        showError(message) {
            this.errorTextEl.textContent = message;
            this.errorEl.hidden = false;
        }

        hideError() {
            this.errorEl.hidden = true;
        }

        showEnd(visible) {
            this.endEl.hidden = !visible;
        }

        showEmpty(visible) {
            this.emptyEl.hidden = !visible;
        }

        isNearBottom() {
            return window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 200;
        }

        bindScroll(handler) {
            window.addEventListener('scroll', handler);
        }

        bindSearch(handler) {
            this.searchEl.addEventListener('input', () => handler(this.searchEl.value));
        }

        bindRetry(handler) {
            this.retryEl.addEventListener('click', handler);
        }
    }

    class PostsController {
        constructor(model, view) {
            this.model = model;
            this.view = view;
            this.debounceTimer = null;
            this.debounceDelay = 300;

            this.view.bindScroll(() => this.checkScroll());
            this.view.bindSearch(text => this.handleSearch(text));
            this.view.bindRetry(() => this.handleRetry());
        }

        init() {
            this.loadMore();
        }

        async loadMore() {
            if (!this.model.canLoad()) return;

            this.view.showLoader(true);
            this.view.hideError();

            await this.model.loadNextPage();

            this.view.showLoader(false);
            if (this.model.hasError) {
                this.view.showError(this.model.errorMessage);
            }

            this.updateView();
            this.checkScroll();
        }

        updateView() {
            const filtered = this.model.getFilteredPosts();
            this.view.renderPosts(filtered);
            this.view.showEmpty(filtered.length === 0 && this.model.posts.length > 0);
            this.view.showEnd(!this.model.hasMore);
        }

        checkScroll() {
            if (this.view.isNearBottom()) {
                this.loadMore();
            }
        }

        handleSearch(text) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.model.setSearchText(text);
                this.updateView();
                this.checkScroll();
            }, this.debounceDelay);
        }

        handleRetry() {
            this.model.resetError();
            this.loadMore();
        }
    }

    const model = new PostsModel();
    const view = new PostsView();
    const controller = new PostsController(model, view);
    controller.init();
})();