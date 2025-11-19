# GalaxyGoals

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.17.

## Features

### MLC (Machine Learning Compilation) Integration

GalaxyGoals includes an optional AI-powered sentence generation feature using WebLLM/MLC. This feature is **disabled by default** to optimize performance on mobile devices.

**To enable MLC:**
- Add `?mlc=true` to any URL (e.g., `http://localhost:4200/?mlc=true`)
- Visit the `/mlc-demo` page and toggle the feature on
- See [MLC-CONFIG.md](./MLC-CONFIG.md) for detailed configuration options

**Why disabled by default:**
- Mobile devices may struggle with the ~500MB+ model downloads
- Requires 2-4GB RAM for optimal performance
- Better UX for the majority of users on mobile devices

**Bundle size optimization:**
- When disabled: MLC libraries (~800KB-1MB) are NOT included in the bundle
- When enabled: MLC libraries are lazy-loaded only when you initialize the engine
- Main bundle stays minimal for users who don't need AI features

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## Publishing

### 1. Build the Angular App for Production
Run the following command to generate the production build:
```sh
npm run build -- --output-path=dist --base-href=/Galaxy-Goals/
```
- `--output-path=dist` ensures the build output goes to the dist folder.
- `--base-href=/` sets the base URL for GitHub Pages.

### 2. Install Angular CLI GitHub Pages Deploy Tool
Install the deploy tool globally (if not already installed):
```sh
npm install -g angular-cli-ghpages
```

### 3. Deploy to GitHub Pages
Run the deploy command:
```sh
npx angular-cli-ghpages --dir=dist
```
- This will push the contents of the dist folder to the `gh-pages` branch of your repository.

### 4. Configure GitHub Pages
- Go to your repository on GitHub.
- Navigate to **Settings** > **Pages**.
- Set the source to the `gh-pages` branch.

### 5. Access Your Site
- After a few minutes, your site will be live at:  
  `https://<your-github-username>.github.io/<your-repo-name>/`
