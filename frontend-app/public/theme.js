try {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.style.backgroundColor = '#090D16';
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.backgroundColor = '#F3F4F6';
  }
} catch (e) {}
