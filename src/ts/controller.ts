import { loadNotes, state } from './model'
import notebookView from './views/notebookView'
import notesView from './views/notesView'
import noteView from './views/noteView'
import snarkdown from 'snarkdown'

export function onClickNote(e: Event): void {
  if (e.target instanceof Element) {
    const closestNote = e.target.closest('.notes__container-note')
    const id = closestNote?.getAttribute('data-noteid')
    if (!id) {
      // remove active class
      notesView.removeActiveClass()
      // show nothing in note view
      noteView.render()
    }
    // render note view
    renderNoteView(id)
    // remove active class from other notes
    notesView.removeActiveClass()
    // add active class to this note
    closestNote?.classList.add('active')
  }
}

function renderNoteView(id: string): void {
  const note = state.notes.find((note) => note.id === id)
  if (note) {
    noteView.render(snarkdown(note.text))
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
}
init()
