import {
  addNewDefaultNote,
  addNewNotebook,
  deleteNote,
  deleteNotebook,
  loadNotes,
  renameNotebook,
  saveNotes,
  showFavoriteNotes,
  showNotesFromNotebook,
  starNote,
  state,
} from './model'
import notebookView from './views/notebookView'
import notesView from './views/notesView'
import noteView from './views/noteView'

if (module.hot) {
  module.hot.accept()
}

type ShowNoteProps =
  | { type: 'RENDER_EMPTY' }
  | { type: 'RENDER_EDITOR' | 'RENDER_PREVIEW'; id: string }

function showNote(props: ShowNoteProps) {
  if (props.type === 'RENDER_EMPTY') {
    notesView.removeActiveClass()
    noteView.render({ type: 'RENDER_EMPTY' })
    return
  }
  const { type, id } = props
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
  // 5. Event handlers for category
  notebookView.addEventHandlerToFavorite(favoriteCategoryController)
  notebookView.addEventHandlerToNotes(allNotesController)
  notebookView.addEventHandlerToTrash(trashedNotesController)
  // 6. Event handler for notebook
  notebookView.addEventHandlerToAddNotebookButton(newNotebookController)
  notebookView.addEventHandlersToNotebook({
    deleteHandler: deleteNotebookController,
    renameHandler: renameNotebookController,
    openHandler: notebookController,
  })
}
init()

function addNewNote(): void {
  // 2. Add the note to state
  const id = addNewDefaultNote()
  // 3. Rerender notesView
  notesView.render(state.notes)
  // 4. Open note in note editor
  showNote({ id, type: 'RENDER_EDITOR' })
}

function deleteNoteController(id: string) {
  deleteNote(id)
  // Re render note view
  notesView.render(state.notes)
  showNote({ type: 'RENDER_EMPTY' })
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

function favoriteCategoryController() {
  const notes = showFavoriteNotes()
  // Re-render views
  notesView.render(notes)
  showNote({ type: 'RENDER_EMPTY' })
}

function allNotesController() {
  notesView.render(state.notes)
  showNote({ type: 'RENDER_EMPTY' })
}

function trashedNotesController() {
  notesView.render(state.trashedNotes)
  showNote({ type: 'RENDER_EMPTY' })
  // TODO Hide create note option in it.
  // 2. Make an option to restore the note
}

function notebookController(id: string) {
  const notes = showNotesFromNotebook(id)
  notesView.render(notes)
  showNote({ type: 'RENDER_EMPTY' })
  // TODO when add new note option is clicked pass this id to it.
}

function renameNotebookController(name: string, id: string) {
  // call model function to rename the notebook
  renameNotebook(name, id)
  // re-render the notebook view
  notebookView.render(state.notebooks)
}

function deleteNotebookController(id: string) {
  // call model function to rename the notebook
  deleteNotebook(id)
  // re-render the notebook view
  notebookView.render(state.notebooks)
}

function newNotebookController(name: string) {
  // Add the notebook to state
  addNewNotebook(name)
  // render the notebook view
  notebookView.render(state.notebooks)
}
