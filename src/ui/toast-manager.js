// У toast-manager.js замініть show() на:

show(message, type = 'info', duration = 3000) {
  if (this.activeToasts.length >= this.maxToasts) {
    const oldest = this.activeToasts.shift();
    if (oldest?.element) this.removeToast(oldest.element, false);
  }

  const id = ++this.toastId;
  const colors = {
    info: 'var(--info)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--danger)'
  };

  const toast = document.createElement('div');
  toast.id = `toast-${id}`;
  toast.className = `toast toast-${type}`;
  toast.style.top = `${80 + this.activeToasts.length * 70}px`;
  toast.innerHTML = `
    <span class="toast-icon">${this.icons[type]}</span>
    <span>${this.escapeHtml(message)}</span>
  `;

  this.container.appendChild(toast);
  this.activeToasts.push({ id, element: toast });

  // Анімація появи
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));

  // Авто-видалення
  const timeout = setTimeout(() => this.removeToast(toast), duration);
  toast.addEventListener('click', () => {
    clearTimeout(timeout);
    this.removeToast(toast);
  });

  return id;
}

removeToast(element) {
  element.classList.remove('show');
  element.classList.add('hide');
  
  setTimeout(() => {
    element.remove();
    const idx = this.activeToasts.findIndex(t => t.element === element);
    if (idx > -1) this.activeToasts.splice(idx, 1);
    this.repositionToasts();
  }, 400);
}
