import {
  addNewNoteToState,
  deleteNote,
  loadNotes,
  saveNotes,
  starNote,
  state,
} from './model'
import notebookView from './views/notebookView'
import notesView from './views/notesView'
import noteView from './views/noteView'
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
  type: 'RENDER_PREVIEW' | 'RENDER_EDITOR' | 'RENDER_EMPTY'
}) {
  if (type === 'RENDER_EMPTY') {
    notesView.removeActiveClass()
    noteView.render({ type: 'RENDER_EMPTY' })
    return
  }
  notesView.removeActiveClass()
  notesView.addActiveClassToNote(id)
  if (type === 'RENDER_EDITOR') {
    // Editor view
    renderEditorView(id)
  } else {
    // preview
    renderNoteView(id)
  }
  // 5. Event handlers to saving, deleting and toggling favorites
  noteView.addDeleteHandler(deleteNoteController)
  noteView.addSaveHandler(saveNotes)
  noteView.addStarHandler(favoriteNoteController)
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
  }
}

function renderNoteView(id: string): void {
  const note = state.notes.find((note) => note.id === id)
  if (note) {
    noteView.render({
      type: 'RENDER_PREVIEW',
      data: note.text,
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

function deleteNoteController(id: string) {
  deleteNote(id)
  // Re render note view
  notesView.render(state.notes)
  showNote({ type: 'RENDER_EMPTY', id: id })
}

function favoriteNoteController(id: string) {
  starNote(id)
  // Re render views
  notesView.render(state.notes)
  notesView.addActiveClassToNote(id)
  const note = state.notes.find((note) => note.id === id)
  if (note) {
    noteView.renderStarIcon(note.favorite)
  }
}
