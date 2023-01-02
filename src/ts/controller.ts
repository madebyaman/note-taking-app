import {
  addNewDefaultNote,
  addNewNotebook,
  changeCategoryOfNote,
  checkIfNotebookIdValid,
  checkIfNoteIdValid,
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

// if (module.hot) {
//   module.hot.accept()
// }

// Get page and note id from the URL
function getPageAndNoteUrl(): { page: string | null; note: string | null } {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const page = urlParams.get('page')
  const note = urlParams.get('note')
  return { page, note }
}

// If notebook url is invalid, navigate to home
function ifNotebookUrlInvalid(id: string): void {
  if (
    id !== 'all' &&
    id !== 'favorites' &&
    id !== 'trash' &&
    !checkIfNotebookIdValid(id)
  ) {
    window.history.pushState({}, '', window.location.origin)
  }
}

// If note url is invalid, navigate to previous `page` or else home
function ifNoteUrlInvalid(id: string): void {
  if (!checkIfNoteIdValid(id)) {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const page = urlParams.get('page')
    if (page) {
      // Put user to previous page URL
      const newUrlParams = new URLSearchParams()
      newUrlParams.set('page', page)
      const newUrl = window.location.origin + '?' + newUrlParams.toString()
      window.history.pushState({}, '', newUrl)
    } else {
      // Navigate to home
      window.history.pushState({}, '', window.location.origin)
    }
  }
}

// Uses the `page` to return notes of that category
function getNotesForPage(page: string): Note[] {
  let notes: Note[]
  if (page === 'all') {
    notes = showAllNotes()
  } else if (page === 'favorites') {
    notes = showFavoriteNotes()
  } else if (page === 'trash') {
    notes = showTrashedNotes()
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
  if (page && note) {
    ifNoteUrlInvalid(note)
    ifNotebookUrlInvalid(page)
    notebookView.render(state.notebooks, page)
    const notes = getNotesForPage(page)
    notesView.render({
      notes,
      activeNoteId: note,
      openNotebook: page,
    })
    showNote({ type: 'RENDER_PREVIEW', id: note, notes })
  } else if (page && !note) {
    ifNotebookUrlInvalid(page)
    notebookView.render(state.notebooks, page)
    notesView.render({ notes: getNotesForPage(page), openNotebook: page })
    showNote({ type: 'RENDER_EMPTY' })
  } else if (!page && note) {
    ifNoteUrlInvalid(note)
    notebookView.render(state.notebooks, 'all')
    notesView.render({ notes: state.notes, activeNoteId: note })
    showNote({ type: 'RENDER_PREVIEW', id: note, notes: showAllNotes() })
  } else {
    // Render home view
    notebookView.render(state.notebooks)
    notesView.render({ notes: showAllNotes() })
    showNote({ type: 'RENDER_EMPTY' })
  }
}

type ShowNoteProps =
  | { type: 'RENDER_EMPTY' }
  | { type: 'RENDER_EDITOR' | 'RENDER_PREVIEW'; id: string; notes: Note[] }

/**
 * 1. Renders `Noteview` in empty, preview or editor mode.
 * 2. Checks if the `id` of note to render is in notes passed.
 * 3. adds delete, save and star handlers
 */
function showNote(props: ShowNoteProps) {
  let note: Note | undefined
  if (props.type !== 'RENDER_EMPTY' && props.notes) {
    note = props.notes.find((note) => note.id === props.id)
  }
  if (props.type === 'RENDER_EMPTY' || !note) {
    noteView.render({ type: 'RENDER_EMPTY' })
    return
  }
  const { type } = props
  if (type === 'RENDER_EDITOR') {
    // Editor view
    if (note) renderEditorView(note)
  } else {
    // preview
    if (note) renderNoteView(note)
  }
  // 5. Event handlers to saving, deleting and toggling favorites
  noteView.addDeleteHandler(deleteNoteController)
  noteView.addSaveHandler(saveNotesAndRefresh)
  noteView.addStarHandler(favoriteNoteController)
}

/**  Navigates to the given note URL
 */
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

// Render editro view in the editor
function renderEditorView(note: Note) {
  noteView.render({
    type: 'RENDER_EDITOR',
    recoverNoteHandler: recoverDeletedNote,
    data: note,
    notebooks: state.notebooks,
  })
}

// Render preview mode in the editor
function renderNoteView(note: Note): void {
  noteView.render({
    type: 'RENDER_PREVIEW',
    data: note,
    recoverNoteHandler: recoverDeletedNote,
    notebooks: state.notebooks,
  })
}

/**
 * a. Add event handler to open note in `notesView`
 * b. add event handler to add new note in `notesView`
 * c. In `notebookView` add event handler to add new notebook, delete notebook, rename and open.
 */
function init(): void {
  // 3. Event handler in notes.
  const removeOpenNoteListener = notesView.openNote(onClickNote)
  // 4. Event handler for new note
  const removeAddNoteListener = notesView.addNewNote(addNewNote)
  const removeSearch = notesView.searchForNotes(searchNotes)
  // 6. Event handler for notebook
  notebookView.addEventHandlerToAddNotebookButton(newNotebookController)
  notebookView.addEventHandlersToNotebook({
    deleteHandler: deleteNotebookController,
    renameHandler: renameNotebookController,
    openHandler: notebookController,
  })
  notebookView.hideNotebooks()
  window.addEventListener('beforeunload', () => {
    if (removeSearch) removeSearch()
    if (removeOpenNoteListener) removeOpenNoteListener()
    if (removeAddNoteListener) removeAddNoteListener()
  })
}

/**
 * Controller function to add new note. It does few things
 * 1. Tells model to add new note
 * 2. Navigate to new note using `onClickNote`
 * 3. Render `noteView` in editor mode
 */
function addNewNote(notebookIdToAdd?: string): void {
  const id = addNewDefaultNote(notebookIdToAdd)
  onClickNote(id)
  const { page } = getPageAndNoteUrl()
  const notes = getNotesForPage(page || 'all')
  showNote({ type: 'RENDER_EDITOR', id, notes })
}

/**
 * Delete note controller. That:
 * 1. Deletes the note using the model function
 * 2. RE-renders the notesview with no active note.
 * 3. Renders the empty view for note.
 */
function deleteNoteController(id: string) {
  deleteNote(id)
  refreshViews()
}

// When clicking on star button, add || remove star and refresh views
function favoriteNoteController(id: string) {
  starNote(id)
  refreshViews()
}

// when notebook button is clicked, move to ?page=notebook url
function notebookController(id: string) {
  const urlParams = new URLSearchParams()
  urlParams.set('page', id)
  const currentUrl = window.location.origin
  const newUrl = currentUrl + '?' + urlParams.toString()
  window.history.pushState({}, '', newUrl)
  refreshViews()
}

// Rename notebook, then refresh views
function renameNotebookController(name: string, id: string) {
  renameNotebook(name, id)
  refreshViews()
}

// Delete notebook, then refresh views
function deleteNotebookController(id: string) {
  deleteNotebook(id)
  refreshViews()
}

// Add new notebook, and move to its page
function newNotebookController(name?: string) {
  if (!name) return
  const id = addNewNotebook(name)
  notebookController(id)
}

function recoverDeletedNote(id: string) {
  recoverNote(id)
  refreshViews()
}

function saveNotesAndRefresh(
  val: string,
  id: string,
  notebookId: string | undefined
) {
  saveNotes(val, id)
  changeCategoryOfNote(id, notebookId)
  refreshViews()
}

function searchNotes(val: string, notebookId: string | undefined) {
  const notes = getNotesForPage(notebookId || 'all')
  const newNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(val.toLowerCase())
  )
  notesView.render({
    notes: newNotes,
    openNotebook: notebookId,
  })
  showNote({ type: 'RENDER_EMPTY' })
}

async function start() {
  await loadNotes()
  refreshViews()
  init()
}

start()
