import { useState } from 'react'
import type { WorkspaceAPI } from '../../hooks/useWorkspace'
import { TreeItem, useContextMenu } from './TreeItem'
import { NewBranchDialog } from './NewBranchDialog'
import { NewCourseDialog } from './NewCourseDialog'
import { NewFileDialog } from './NewFileDialog'
import { ConfirmDelete } from './ConfirmDelete'

interface Props {
  api: WorkspaceAPI
  selectedFile: string | null
  onSelectFile: (path: string) => void
  initialExpanded?: string[]
}

export function WorkspaceTree({ api, selectedFile, onSelectFile, initialExpanded }: Props) {
  const { workspace, createBranch, deleteBranch, createCourse, deleteCourse, createFile, deleteFile } = api

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    if (initialExpanded) {
      for (const key of initialExpanded) {
        init[`branch:${key}`] = true
        init[`course:${key}`] = true
      }
    }
    return init
  })
  const [showNewBranch, setShowNewBranch] = useState(false)
  const [showNewCourse, setShowNewCourse] = useState<{ branch: string } | null>(null)
  const [showNewFile, setShowNewFile] = useState<{ branch: string; course: string } | null>(null)
  const [confirm, setConfirm] = useState<{ title: string; message: string; action: () => void } | null>(null)

  const branchMenu = useContextMenu()
  const courseMenu = useContextMenu()
  const fileMenu = useContextMenu()

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  const filePath = (branch: string, course: string, filename: string) => `${branch}/${course}/${filename}`

  return (
    <div style={{ padding: '0.5rem 0', userSelect: 'none', overflow: 'auto', height: '100%' }}>
      <div style={{ padding: '0.25rem 0.75rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
        WORKSPACE
      </div>

      <div style={{ padding: '0 0.5rem', marginBottom: '0.25rem' }}>
        <button onClick={() => setShowNewBranch(true)} style={addBtn}>+ New Branch</button>
      </div>

      {workspace.branches.map(branch => (
        <div key={branch}>
          <TreeItem
            label={branch}
            depth={0}
            icon="📁"
            expanded={expanded[`branch:${branch}`]}
            onToggle={() => toggle(`branch:${branch}`)}
            onContextMenu={e => branchMenu.show(e, [
              { label: 'New Course', action: () => setShowNewCourse({ branch }) },
              { label: 'Rename', action: () => {
                const newName = prompt('New branch name:', branch)
                if (newName && newName !== branch) api.renameBranch(branch, newName)
              }},
              { label: 'Delete', action: () => setConfirm({
                title: 'Delete Branch',
                message: `Delete "${branch}" and all its courses and files?`,
                action: () => deleteBranch(branch),
              }), danger: true },
            ])}
          >
            {(workspace.courses[branch] || []).map(course => (
              <div key={course}>
                <TreeItem
                  label={course}
                  depth={1}
                  icon="📂"
                  expanded={expanded[`course:${branch}/${course}`]}
                  onToggle={() => toggle(`course:${branch}/${course}`)}
                  onContextMenu={e => courseMenu.show(e, [
                    { label: 'New File', action: () => setShowNewFile({ branch, course }) },
                    { label: 'Rename', action: () => {
                      const newName = prompt('New course name:', course)
                      if (newName && newName !== course) api.renameCourse(branch, course, newName)
                    }},
                    { label: 'Delete', action: () => setConfirm({
                      title: 'Delete Course',
                      message: `Delete "${course}" and all its files?`,
                      action: () => deleteCourse(branch, course),
                    }), danger: true },
                  ])}
                >
                  {api.listFiles(branch, course).map(filename => (
                    <TreeItem
                      key={filename}
                      label={filename}
                      depth={2}
                      icon="📄"
                      selected={selectedFile === filePath(branch, course, filename)}
                      onClick={() => onSelectFile(filePath(branch, course, filename))}
                      onContextMenu={e => fileMenu.show(e, [
                        { label: 'Open', action: () => onSelectFile(filePath(branch, course, filename)) },
                        { label: 'Rename', action: () => {
                          const newName = prompt('New filename:', filename)
                          if (newName && newName !== filename) api.renameFile(branch, course, filename, newName)
                        }},
                        { label: 'Delete', action: () => setConfirm({
                          title: 'Delete File',
                          message: `Delete "${filename}"?`,
                          action: () => deleteFile(branch, course, filename),
                        }), danger: true },
                      ])}
                    />
                  ))}

                  <div style={{ paddingLeft: '2.5rem', marginTop: '0.15rem' }}>
                    <button onClick={() => setShowNewFile({ branch, course })} style={addBtnSmall}>+ New File</button>
                  </div>
                </TreeItem>
              </div>
            ))}

            <div style={{ paddingLeft: '1.5rem', marginTop: '0.15rem' }}>
              <button onClick={() => setShowNewCourse({ branch })} style={addBtnSmall}>+ New Course</button>
            </div>
          </TreeItem>
        </div>
      ))}

      {branchMenu.menuEl}
      {courseMenu.menuEl}
      {fileMenu.menuEl}

      <NewBranchDialog open={showNewBranch} onConfirm={async (name) => { await createBranch(name); setShowNewBranch(false) }} onCancel={() => setShowNewBranch(false)} />
      <NewCourseDialog open={!!showNewCourse} onConfirm={async (name) => { await createCourse(showNewCourse!.branch, name); setShowNewCourse(null) }} onCancel={() => setShowNewCourse(null)} />
      <NewFileDialog open={!!showNewFile} onConfirm={async (filename, template) => { await createFile(showNewFile!.branch, showNewFile!.course, filename, template); onSelectFile(filePath(showNewFile!.branch, showNewFile!.course, filename)); setShowNewFile(null) }} onCancel={() => setShowNewFile(null)} />
      <ConfirmDelete open={!!confirm} title={confirm?.title ?? ''} message={confirm?.message ?? ''} onConfirm={() => { confirm?.action(); setConfirm(null) }} onCancel={() => setConfirm(null)} />
    </div>
  )
}

const addBtn: React.CSSProperties = {
  width: '100%', padding: '0.3em 0.5em', borderRadius: 'var(--radius-sm)',
  border: '1px dashed var(--border)', backgroundColor: 'transparent',
  color: 'var(--text-muted)', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-xs)',
  textAlign: 'left',
}
const addBtnSmall: React.CSSProperties = {
  ...addBtn, fontSize: 'var(--font-size-xs)', padding: '0.15em 0.4em',
}
