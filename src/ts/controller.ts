import {
  addNewDefaultNote,
  addNewNotebook,
  checkNotebook,
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
  } else if (!checkNotebook(page)) {
    // It means category is invalid.
    console.log('DONT Tell me you are here')
    navigateToHome()
    refreshViews()
    return []
  } else if (page) {
    notes = showNotesFromNotebook(page)
  } else {
    notes = []
  }
  return notes
}

// Refresh views
function refreshViews(): void {
  const { page, note } = getPageAndNoteUrl()
  console.log('refreshed view', page, note)
  if (page && note) {
    notebookView.render(state.notebooks, page)
    notesView.render({
      notes: getNotesForPage(page),
      activeNoteId: note,
      openNotebook: page,
    })
    showNote({ type: 'RENDER_PREVIEW', id: note })
  } else if (page && !note) {
    notebookView.render(state.notebooks, page)
    notesView.render({ notes: getNotesForPage(page), openNotebook: page })
    showNote({ type: 'RENDER_EMPTY' })
  } else if (!page && note) {
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

// Navigates to the note
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

/**
 * Controller function to add new note. It does few things
 * 1. Tells model to add new note
 * 2. Navigate to new note using `onClickNote`
 * 3. Refresh view
 */
function addNewNote(notebookIdToAdd?: string): void {
  const id = addNewDefaultNote(notebookIdToAdd)
  onClickNote(id)
  refreshViews()
}

/**
 * Delete note controller. That:
 * 1. Deletes the note using the model function
 * 2. RE-renders the notesview with no active note.
 * 3. Renders the empty view for note.
 */
function deleteNoteController(id: string) {
  deleteNote(id)
  notesView.render({ notes: showAllNotes() })
  showNote({ type: 'RENDER_EMPTY' })
}

function favoriteNoteController(id: string) {
  starNote(id)
  notesView.render({ notes: showAllNotes(), activeNoteId: id })
  const note = state.notes.find((note) => note.id === id)
  if (note) {
    noteView.renderStarIcon(note.favorite)
  }
}

function trashedNotesController() {
  notesView.render({ notes: showTrashedNotes(), openNotebook: 'trash' })
  showNote({ type: 'RENDER_EMPTY' })
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
  renameNotebook(name, id)
  refreshViews()
}

function deleteNotebookController(id: string) {
  deleteNotebook(id)
  refreshViews()
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
