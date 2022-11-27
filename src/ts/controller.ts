import { loadNotes, state } from './model'
import notebookView from './views/notebookView'
import notesView from './views/notesView'

export function onClickNote(e: Event): void {
  // Get id of clicked note
  console.log(e.target)
  // Log it
}

function init(): void {
  loadNotes()
  // 1. Render notebook view
  notebookView.render(state.notebooks)
  // 2. Render notes view
  notesView.render(state.notes)
  // 3. Event handler in notes.
  notesView.addHandler(onClickNote)
}
init()
