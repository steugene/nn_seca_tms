import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'nn-seca-tms-theme';
  private isDarkThemeSubject = new BehaviorSubject<boolean>(this.getStoredTheme());

  constructor() {
    this.applyTheme(this.isDarkThemeSubject.value);
  }

  get isDarkTheme$(): Observable<boolean> {
    return this.isDarkThemeSubject.asObservable();
  }

  get isDarkTheme(): boolean {
    return this.isDarkThemeSubject.value;
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkThemeSubject.value;
    this.setTheme(newTheme);
  }

  setTheme(isDark: boolean): void {
    this.isDarkThemeSubject.next(isDark);
    this.applyTheme(isDark);
    this.storeTheme(isDark);
  }

  private getStoredTheme(): boolean {
    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored !== null) {
      return stored === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private storeTheme(isDark: boolean): void {
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean): void {
    const body = document.body;
    if (isDark) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }
} 