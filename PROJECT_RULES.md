# FilmMate Project Rules

## 1. Clean Code

- **Use Descriptive Names:**  
  All variables, functions, and components must have clear, descriptive names.
- **Keep Functions Small:**  
  Each function should do one thing. If it’s getting long or complex, break it up.
- **Consistent Formatting:**  
  Use a linter (e.g., ESLint) and code formatter (e.g., Prettier) to maintain consistent style.
- **Comment Wisely:**  
  Write comments for complex logic, but avoid obvious comments. Update comments if code changes.
- **Organize by Feature:**  
  Group related files (components, logic, styles) by feature or screen, not by file type.
- **Avoid Magic Numbers:**  
  Use named constants for any numbers or strings with special meaning.
- **Type Safety:**  
  Use TypeScript for all code. Define clear types and interfaces for all data structures.

## 2. Accessibility (a11y)

- **Semantic HTML:**  
  Use proper HTML elements (e.g., `<button>`, `<label>`, `<nav>`, `<main>`) for structure and meaning.
- **Keyboard Navigation:**  
  All interactive elements must be accessible via keyboard (Tab, Enter, Space).
- **Alt Text:**  
  All images must have meaningful `alt` attributes.
- **Color Contrast:**  
  Ensure sufficient contrast between text and background. Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
- **ARIA Labels:**  
  Use ARIA attributes only when necessary, and never as a substitute for semantic HTML.
- **Focus Management:**  
  Manage focus when navigating between screens or opening dialogs/modals.
- **Accessible Forms:**  
  All form fields must have associated `<label>` elements.

## 3. Performance

- **Efficient Rendering:**  
  Avoid unnecessary re-renders. Use React.memo, useCallback, and useMemo where appropriate.
- **Lazy Loading:**  
  Load screens and heavy components only when needed (React.lazy, dynamic imports).
- **Optimize Assets:**  
  Compress images and use appropriate formats (e.g., SVG for icons).
- **Minimize Dependencies:**  
  Only add libraries if they provide clear value and are well-maintained.
- **Local Storage Usage:**  
  Read from and write to local storage efficiently. Avoid excessive reads/writes.
- **Responsive Design:**  
  Ensure the app works smoothly on both mobile and desktop devices.

## 4. General

- **Code Reviews:**  
  All code must be reviewed by at least one other person before merging.
- **Testing:**  
  Write tests for core logic (e.g., exposure calculations). Use tools like Jest and React Testing Library.
- **Documentation:**  
  Keep this rules file and all documentation up to date as the project evolves.

---

**Let’s build FilmMate to be clean, accessible, and fast for everyone!** 