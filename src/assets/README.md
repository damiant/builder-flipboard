# Assets Directory

This directory contains static assets for the Angular application.

## Structure

- **fonts/** - Custom font files (woff, woff2, ttf, etc.)
- **images/** - Image assets (png, jpg, svg, etc.)
- **icons/** - Icon files and icon fonts

## Usage

Assets in this directory can be referenced in your application using relative paths from the root:

```css
/* In CSS files */
@font-face {
  font-family: 'CustomFont';
  src: url('/assets/fonts/custom-font.woff2') format('woff2');
}

background-image: url('/assets/images/background.png');
```

```html
<!-- In HTML templates -->
<img src="/assets/images/logo.png" alt="Logo">
```

## Build Process

During the Angular build process, assets in this directory are copied to the output directory and can be served statically.
