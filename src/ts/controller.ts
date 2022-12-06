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
import notebookView from './views/notebookView'
import notesView from './views/notesView'
import noteView from './views/noteView'

if (module.hot) {
  module.hot.accept()
}

function getPageAndNoteUrl(): { page: string | null; note: string | null } {
  // Get the query string from the URL
  const queryString = window.location.search

  // Parse the query string using the URLSearchParams interface
  const urlParams = new URLSearchParams(queryString)

  // Get the value of the "page" and "note" parameters from the query string
  const page = urlParams.get('page')
  const note = urlParams.get('note')
  return { page, note }
}

function refreshViews(): void {
  init()
  const { page, note } = getPageAndNoteUrl()
  console.log('refreshed view', page, note)
  if (page && note) {
    // Show page like notebook, all notes, favorites, trash
    // Render notebook view
    notebookView.render(state.notebooks, page)
    const categoryNotes = showNotesFromNotebook(page)
    notesView.render({ notes: categoryNotes, activeNoteId: note })
    // Also show that note
    showNote({ type: 'RENDER_PREVIEW', id: note })
    // Render note view
  } else if (page) {
    // Empty note view
    // Page view
    notebookView.render(state.notebooks, page)
    const categoryNotes = showNotesFromNotebook(page)
    notesView.render({ notes: categoryNotes })
  } else {
    // Render home view
    notebookView.render(state.notebooks)
    notesView.render({ notes: state.notes })
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
  // showNote({ id: id, type: 'RENDER_PREVIEW' })
  // Create a new URLSearchParams object and set the "page" and "note" parameters
  const urlParams = new URLSearchParams()
  urlParams.set('note', id)

  // Get the current URL and append the updated query string to it
  const currentUrl = window.location.href
  const newUrl = currentUrl + '&&' + urlParams.toString()

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
refreshViews()

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

function favoriteCategoryController() {
  const notes = showFavoriteNotes()
  // Re-render views
  notesView.render({ notes })
  showNote({ type: 'RENDER_EMPTY' })
}

function allNotesController() {
  notesView.render({ notes: showAllNotes() })
  showNote({ type: 'RENDER_EMPTY' })
}

function trashedNotesController() {
  notesView.render({ notes: showTrashedNotes(), hideCreateNewNoteButton: true })
  showNote({ type: 'RENDER_EMPTY' })
  // Add handler to recover deleted note
}

function notebookController(id: string) {
  // const notes = showNotesFromNotebook(id)
  // notesView.render({ notes, newNoteNotebookId: id })
  // showNote({ type: 'RENDER_EMPTY' })
  // Redirect to new page
  const urlParams = new URLSearchParams()
  urlParams.set('page', id)
  // Get the current URL and append the updated query string to it
  const currentUrl = window.location.origin
  const newUrl = currentUrl + '?' + urlParams.toString()
  window.history.pushState({}, '', newUrl)
  // TODO when add new note option is clicked pass this id to it.
  refreshViews()
}

function renameNotebookController(name: string, id: string) {
  // call model function to rename the notebook
  renameNotebook(name, id)
  // re-render the notebook view
  notebookView.render(state.notebooks)
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
