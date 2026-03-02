import { useEffect, useMemo, useRef, useState } from 'react'
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react'
import './App.css'

type ProjectManifest = {
  id: string
  name: string
  activeFile?: string
}

type ProjectFile = {
  code: string
  active?: boolean
}

type ProjectTemplate = {
  id: string
  name: string
  activeFile: string
  files: Record<string, ProjectFile>
  visibleFiles: string[]
}

const EXPLORER_WIDTH_STORAGE_KEY = 'react-playground:explorer-width'
const CODE_PREVIEW_WIDTH_STORAGE_KEY = 'react-playground:code-preview-width'
const MIN_EXPLORER_WIDTH = 160
const MAX_EXPLORER_WIDTH = 420
const DEFAULT_CODE_PANEL_WIDTH = 760
const MIN_CODE_PANEL_WIDTH = 420
const MIN_PREVIEW_PANEL_WIDTH = 320

const clampExplorerWidth = (value: number) => {
  return Math.min(MAX_EXPLORER_WIDTH, Math.max(MIN_EXPLORER_WIDTH, value))
}

const manifestModules = import.meta.glob('../projects/*/manifest.json', {
  eager: true,
  import: 'default',
}) as Record<string, ProjectManifest>

const projectFileModules = import.meta.glob('../projects/*/files/**/*', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const buildProjectTemplates = (): ProjectTemplate[] => {
  const projects = new Map<string, ProjectTemplate>()

  for (const [manifestPath, manifest] of Object.entries(manifestModules)) {
    const projectId = manifestPath.split('/')[2]
    const activeFile = manifest.activeFile ?? '/App.tsx'

    projects.set(projectId, {
      id: manifest.id || projectId,
      name: manifest.name || projectId,
      activeFile,
      files: {},
      visibleFiles: [],
    })
  }

  for (const [filePath, fileCode] of Object.entries(projectFileModules)) {
    const segments = filePath.split('/')
    const projectId = segments[2]
    const filesIndex = segments.indexOf('files')

    if (filesIndex === -1) {
      continue
    }

    const project = projects.get(projectId)

    if (!project) {
      continue
    }

    const relativePath = `/${segments.slice(filesIndex + 1).join('/')}`

    project.files[relativePath] = {
      code: fileCode,
      active: relativePath === project.activeFile,
    }

    project.visibleFiles.push(relativePath)
  }

  return [...projects.values()]
    .map((project) => ({
      ...project,
      visibleFiles: project.visibleFiles.sort((first, second) => first.localeCompare(second)),
    }))
    .sort((first, second) => first.name.localeCompare(second.name))
}

const projectTemplates = buildProjectTemplates()
const fallbackProject: ProjectTemplate = {
  id: 'empty',
  name: 'Empty Project',
  activeFile: '/App.tsx',
  files: {
    '/App.tsx': {
      code: `export default function App() {
  return <h2>No project templates found.</h2>;
}
`,
      active: true,
    },
  },
  visibleFiles: ['/App.tsx'],
}

function App() {
  const initialProjectId = projectTemplates[0]?.id ?? fallbackProject.id

  const [sandboxInstance, setSandboxInstance] = useState(0)
  const [selectedProjectId, setSelectedProjectId] = useState(() => initialProjectId)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const rawValue = window.localStorage.getItem(EXPLORER_WIDTH_STORAGE_KEY)
    const parsedValue = Number(rawValue)

    if (Number.isFinite(parsedValue)) {
      return clampExplorerWidth(parsedValue)
    }

    return 220
  })
  const [codePanelWidth, setCodePanelWidth] = useState(() => {
    const rawValue = window.localStorage.getItem(CODE_PREVIEW_WIDTH_STORAGE_KEY)
    const parsedValue = Number(rawValue)

    if (Number.isFinite(parsedValue)) {
      return Math.max(MIN_CODE_PANEL_WIDTH, parsedValue)
    }

    return DEFAULT_CODE_PANEL_WIDTH
  })

  const [isExplorerResizing, setIsExplorerResizing] = useState(false)
  const [isCodePreviewResizing, setIsCodePreviewResizing] = useState(false)

  const explorerResizeStart = useRef<{ x: number; width: number } | null>(null)
  const codeResizeStart = useRef<{ x: number; width: number } | null>(null)
  const splitContainerRef = useRef<HTMLDivElement | null>(null)

  const selectedProject = useMemo(() => {
    return projectTemplates.find((project) => project.id === selectedProjectId) ?? fallbackProject
  }, [selectedProjectId])

  useEffect(() => {
    window.localStorage.setItem(EXPLORER_WIDTH_STORAGE_KEY, String(sidebarWidth))
  }, [sidebarWidth])

  useEffect(() => {
    window.localStorage.setItem(CODE_PREVIEW_WIDTH_STORAGE_KEY, String(codePanelWidth))
  }, [codePanelWidth])

  useEffect(() => {
    if (!isExplorerResizing) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!explorerResizeStart.current) {
        return
      }

      const delta = event.clientX - explorerResizeStart.current.x
      const nextWidth = clampExplorerWidth(explorerResizeStart.current.width + delta)
      setSidebarWidth(nextWidth)
    }

    const handleMouseUp = () => {
      explorerResizeStart.current = null
      setIsExplorerResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isExplorerResizing])

  useEffect(() => {
    if (!isCodePreviewResizing) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!codeResizeStart.current || !splitContainerRef.current) {
        return
      }

      const containerRect = splitContainerRef.current.getBoundingClientRect()
      const maxCodeWidth = Math.max(MIN_CODE_PANEL_WIDTH, containerRect.width - MIN_PREVIEW_PANEL_WIDTH)
      const delta = event.clientX - codeResizeStart.current.x
      const nextWidth = Math.min(
        maxCodeWidth,
        Math.max(MIN_CODE_PANEL_WIDTH, codeResizeStart.current.width + delta),
      )

      setCodePanelWidth(nextWidth)
    }

    const handleMouseUp = () => {
      codeResizeStart.current = null
      setIsCodePreviewResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isCodePreviewResizing])

  const handleReset = () => {
    setSandboxInstance((value) => value + 1)
  }

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProjectId(event.target.value)
    setSandboxInstance((value) => value + 1)
  }

  const handleExplorerResizeStart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    explorerResizeStart.current = { x: event.clientX, width: sidebarWidth }
    setIsExplorerResizing(true)
  }

  const handleCodePreviewResizeStart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    codeResizeStart.current = { x: event.clientX, width: codePanelWidth }
    setIsCodePreviewResizing(true)
  }

  return (
    <main className="playground-shell">
      <header className="playground-header">
        <div>
          <h1>React Playground</h1>
          <p>Select a project, edit files, and preview instantly.</p>
        </div>

        <div className="playground-header-actions">
          <label className="project-picker">
            <span>Project</span>
            <select value={selectedProject.id} onChange={handleProjectChange}>
              {projectTemplates.length > 0 ? (
                projectTemplates.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              ) : (
                <option value={fallbackProject.id}>{fallbackProject.name}</option>
              )}
            </select>
          </label>

          <button className="playground-reset" onClick={handleReset} type="button">
            Reset Code
          </button>
        </div>
      </header>

      <section className="playground-content">
        <SandpackProvider
          key={`${selectedProject.id}-${sandboxInstance}`}
          template="react-ts"
          files={selectedProject.files}
          options={{
            autorun: true,
            activeFile: selectedProject.activeFile,
            recompileMode: 'immediate',
            recompileDelay: 0,
          }}
        >
          <SandpackLayout className="playground-sandpack-layout">
            <div
              className={`playground-layout ${isCodePreviewResizing ? 'is-code-preview-resizing' : ''}`}
              ref={splitContainerRef}
              style={{
                gridTemplateColumns: `${codePanelWidth}px 8px minmax(${MIN_PREVIEW_PANEL_WIDTH}px, 1fr)`,
              }}
            >
              <div className="playground-editor-pane" style={{ gridTemplateColumns: `${sidebarWidth}px 8px 1fr` }}>
                <div className="playground-explorer">
                  <div className="playground-explorer-header">
                    <span>Files</span>
                  </div>
                  <SandpackFileExplorer style={{ height: '100%' }} autoHiddenFiles />
                </div>

                <button
                  className={`playground-resize-handle ${isExplorerResizing ? 'is-active' : ''}`}
                  type="button"
                  aria-label="Resize file explorer"
                  onMouseDown={handleExplorerResizeStart}
                />

                <div className="playground-code-pane">
                  <SandpackCodeEditor
                    showTabs
                    showLineNumbers
                    wrapContent
                    closableTabs={false}
                    style={{ height: '100%' }}
                  />
                </div>
              </div>

              <button
                className={`playground-panel-resize-handle ${isCodePreviewResizing ? 'is-active' : ''}`}
                type="button"
                aria-label="Resize code and preview panels"
                onMouseDown={handleCodePreviewResizeStart}
              />

              <div className="playground-preview-pane">
                <SandpackPreview showOpenInCodeSandbox={false} showRefreshButton style={{ height: '100%' }} />
              </div>
            </div>
          </SandpackLayout>
        </SandpackProvider>
      </section>
    </main>
  )
}

export default App
