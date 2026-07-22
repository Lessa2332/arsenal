import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToastManager } from '../src/ui/toast-manager.js';

describe('ToastManager', () => {
  let toastManager;

  beforeEach(() => {
    document.body.innerHTML = '';
    toastManager = new ToastManager();
  });

  it('should create ui-root if not exists', () => {
    const container = document.getElementById('ui-root');
    expect(container).toBeTruthy();
    expect(container.style.zIndex).toBe('99999');
  });

  it('should show toast with correct type', () => {
    const id = toastManager.show('Test message', 'success');
    expect(id).toBe(1);
    expect(toastManager.activeToasts.length).toBe(1);
  });

  it('should limit max toasts', () => {
    toastManager.show('1');
    toastManager.show('2');
    toastManager.show('3');
    toastManager.show('4'); // Перевищуємо ліміт
    
    expect(toastManager.activeToasts.length).toBe(3);
  });

  it('should escape HTML in message', () => {
    toastManager.show('<script>alert("xss")</script>');
    const toast = document.querySelector('.toast');
    expect(toast.innerHTML).not.toContain('<script>');
  });

  it('should clear all toasts', () => {
    toastManager.show('1');
    toastManager.show('2');
    toastManager.clearAll();
    expect(toastManager.activeToasts.length).toBe(0);
  });
});
