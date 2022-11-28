import { addNewNoteToState, loadNotes, state } from './model'
import notebookView from './views/notebookView'
import notesView from './views/notesView'
import noteView from './views/noteView'
import snarkdown from 'snarkdown'
import { v4 } from 'uuid'
import { NoteWithoutTitleAndNotebook } from './types'

if (module.hot) {
  module.hot.accept()
}

function showNote({
  id,
  type,
}: {
  id: string
  type: 'RENDER_PREVIEW' | 'RENDER_EDITOR'
}) {
  const note = document.querySelector(`article[data-noteid="${id}"]`)
  if (!note) {
    console.log('No note found to show')
    return
  } else {
    notesView.removeActiveClass()
    note.classList.add('active')
    if (type === 'RENDER_EDITOR') {
      // Editor view
      renderEditorView(id)
    } else {
      // preview
      renderNoteView(id)
    }
  }
}

export function onClickNote(e: Event): void {
  if (e.target instanceof Element) {
    const closestNote = e.target.closest('.notes__container-note')
    const id = closestNote?.getAttribute('data-noteid')
    if (!id) {
      // remove active class
      notesView.removeActiveClass()
      // show nothing in note view
      noteView.render({ type: 'RENDER_EMPTY' })
    } else {
      showNote({ id: id, type: 'RENDER_PREVIEW' })
    }
  }
}

function renderEditorView(id: string) {
  const note = state.notes.find((note) => note.id === id)
  if (note) {
    noteView.render({
      type: 'RENDER_EDITOR',
      data: note.text,
      id: note.id,
      favorite: this.favorite,
    })
    noteView.loadMdEditor()
  }
}

function renderNoteView(id: string): void {
  const note = state.notes.find((note) => note.id === id)
  if (note) {
    noteView.render({
      type: 'RENDER_PREVIEW',
      data: snarkdown(note.text),
      id: note.id,
      favorite: this.favorite,
    })
  }
}

function init(): void {
  loadNotes()
  // 1. Render notebook view
  notebookView.render(state.notebooks)
  // 2. Render notes view
  notesView.render(state.notes)
  // 3. Event handler in notes.
  notesView.addHandler(onClickNote)
  // 4. Event handler for new note
  notesView.addHandlerForNewNote(addNewNote)
}
init()

function addNewNote(): void {
  // 2. Create new note and open it in Editor view
  const newNote: NoteWithoutTitleAndNotebook = {
    id: v4(),
    text: '',
    notebookId: '',
    favorite: false,
    createdDate: new Date(Date.now()).toISOString(),
  }
  // 2. Add the note to state
  addNewNoteToState(newNote)
  // 3. Rerender notesView
  notesView.render(state.notes)
  // 4. Open note in note editor
  showNote({ id: newNote.id, type: 'RENDER_EDITOR' })
}
