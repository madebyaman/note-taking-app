import {
  addNewDefaultNote,
  addNewNotebook,
  deleteNote,
  deleteNotebook,
  loadNotes,
  recoverNote,
  renameNotebook,
  saveNotes,
  showAllNotes,
  showFavoriteNotes,
  showNotesFromNotebook,
  showTrashedNotes,
  starNote,
  state,
} from './model'
import { Note } from './types'
import notebookView from './views/notebookView'
import notesView from './views/notesView'
import noteView from './views/noteView'

if (module.hot) {
  module.hot.accept()
}

function getPageAndNoteUrl(): { page: string | null; note: string | null } {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const page = urlParams.get('page')
  const note = urlParams.get('note')
  return { page, note }
}

function navigateToHome(): void {
  window.history.pushState({}, '', window.location.origin)
}

function getNotesForPage(page: string): Note[] {
  let notes: Note[]
  if (page === 'all') {
    notes = state.notes
  } else if (page === 'favorites') {
    notes = showFavoriteNotes()
  } else if (page === 'trash') {
    notes = showTrashedNotes()
  } else if (page) {
    notes = showNotesFromNotebook(page)
    if (!notes.length) {
      // It means category is invalid.
      navigateToHome()
      refreshViews()
      return []
    }
  } else {
    notes = []
  }
  return notes
}

function refreshViews(): void {
  const { page, note } = getPageAndNoteUrl()
  console.log('refreshed view', page, note)
  if (page && note) {
    // Show page like notebook, all notes, favorites, trash
    // Render notebook view
    notebookView.render(state.notebooks, page)
    notesView.render({ notes: getNotesForPage(page), activeNoteId: note })
    // Also show that note
    showNote({ type: 'RENDER_PREVIEW', id: note })
    // Render note view
  } else if (page) {
    // Empty note view
    // Page view
    notebookView.render(state.notebooks, page)
    notesView.render({ notes: getNotesForPage(page) })
    showNote({ type: 'RENDER_EMPTY' })
  } else if (note) {
    console.log('only note')
    notebookView.render(state.notebooks, 'all')
    notesView.render({ notes: state.notes, activeNoteId: note })
    showNote({ type: 'RENDER_PREVIEW', id: note })
  } else {
    // Render home view
    notebookView.render(state.notebooks)
    notesView.render({ notes: state.notes })
    showNote({ type: 'RENDER_EMPTY' })
  }
}

type ShowNoteProps =
  | { type: 'RENDER_EMPTY' }
  | { type: 'RENDER_EDITOR' | 'RENDER_PREVIEW'; id: string }

function showNote(props: ShowNoteProps) {
  if (props.type === 'RENDER_EMPTY') {
    noteView.render({ type: 'RENDER_EMPTY' })
    return
  }
  const { type, id } = props
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

function onClickNote(id: string): void {
  const queryString = window.location.search
  const oldParams = new URLSearchParams(queryString)
  const page = oldParams.get('page')
  const urlParams = new URLSearchParams()
  if (page) {
    urlParams.set('page', page)
  }
  urlParams.set('note', id)

  const currentUrl = window.location.origin
  const newUrl = currentUrl + '?' + urlParams.toString()

  // Use the pushState() method of the window.history API to update the URL in the browser's address bar
  window.history.pushState({}, '', newUrl)
  refreshViews()
}

function renderEditorView(id: string) {
  const note = state.notes.find((note) => note.id === id)
  if (note) {
    noteView.render({
      type: 'RENDER_EDITOR',
      recoverNoteHandler: recoverDeletedNote,
      data: note,
    })
  }
}

function renderNoteView(id: string): void {
  const note = state.notes.find((note) => note.id === id)
  console.log(note)
  if (note) {
    noteView.render({
      type: 'RENDER_PREVIEW',
      data: note,
      recoverNoteHandler: recoverDeletedNote,
    })
  } else {
    // No note found means, noteId is invalid
    navigateToHome()
    refreshViews()
  }
}

function init(): void {
  loadNotes()
  // 1. Render notebook view
  notebookView.render(state.notebooks)
  // 2. Render notes view
  notesView.render({ notes: showAllNotes() })
  // 3. Event handler in notes.
  notesView.addClickEventHandlerToOpen(onClickNote)
  // 4. Event handler for new note
  notesView.addHandlerForNewNote(addNewNote)
  // 6. Event handler for notebook
  notebookView.addEventHandlerToAddNotebookButton(newNotebookController)
  notebookView.addEventHandlersToNotebook({
    deleteHandler: deleteNotebookController,
    renameHandler: renameNotebookController,
    openHandler: notebookController,
  })
}
refreshViews()
init()

function addNewNote(notebookIdToAdd?: string): void {
  // 2. Add the note to state
  const id = addNewDefaultNote(notebookIdToAdd)
  // 3. Rerender notesView
  notesView.render({ notes: showAllNotes(), activeNoteId: id })
  // 4. Open note in note editor
  showNote({ id, type: 'RENDER_EDITOR' })
}

function deleteNoteController(id: string) {
  deleteNote(id)
  // Re render note view
  notesView.render({ notes: showAllNotes() })
  showNote({ type: 'RENDER_EMPTY' })
}

function favoriteNoteController(id: string) {
  starNote(id)
  // Re render views
  notesView.render({ notes: showAllNotes(), activeNoteId: id })
  const note = state.notes.find((note) => note.id === id)
  if (note) {
    noteView.renderStarIcon(note.favorite)
  }
}

function trashedNotesController() {
  notesView.render({ notes: showTrashedNotes(), hideCreateNewNoteButton: true })
  showNote({ type: 'RENDER_EMPTY' })
  // Add handler to recover deleted note
}

function notebookController(id: string) {
  const urlParams = new URLSearchParams()
  urlParams.set('page', id)
  const currentUrl = window.location.origin
  const newUrl = currentUrl + '?' + urlParams.toString()
  window.history.pushState({}, '', newUrl)
  refreshViews()
}

function renameNotebookController(name: string, id: string) {
  // call model function to rename the notebook
  renameNotebook(name, id)
  // re-render the notebook view
  refreshViews()
  // change the name for Notebook in all notes
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

function recoverDeletedNote(id: string) {
  recoverNote(id)
  trashedNotesController()
}
