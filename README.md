# React Playground (Multi-Project)

This repository is a Vite + React playground with:

- live code editing,
- instant preview,
- file explorer,
- resizable editor/preview panes,
- project switching from a dropdown.

## Run locally

```bash
npm install
npm run dev
```

Or use VS Code Run and Debug with the launch profile in `.vscode/launch.json`.

## Project template system

Projects are defined under the root `projects/` folder. Each folder is a template that is loaded automatically into the project dropdown.

### Required structure

```text
projects/
  your-project-id/
    manifest.json
    files/
      App.tsx
      components/
      styles.css
```

### `manifest.json` schema

```json
{
  "id": "your-project-id",
  "name": "Your Project Name",
  "activeFile": "/App.tsx"
}
```

- `id`: unique identifier used as project key.
- `name`: label shown in the homepage dropdown.
- `activeFile`: file opened first when project loads.

### File loading rules

- Every file under `projects/<id>/files/` is loaded into Sandpack.
- The in-playground file path is the same path prefixed with `/`.
  - Example: `projects/todo/files/components/TodoList.tsx` becomes `/components/TodoList.tsx`.
- Switching dropdown value remounts Sandpack and loads the selected project file tree + preview.

## Add a new project

1. Create a new folder under `projects/`.
2. Add `manifest.json` with `id`, `name`, and `activeFile`.
3. Add all project files under `files/`.
4. Start dev server (`npm run dev`) and select the project from the dropdown.

No extra registration step is needed.
