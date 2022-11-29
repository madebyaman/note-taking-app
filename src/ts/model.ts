import defaultNotes from '../notes.json'
import defaultNotebooks from '../notebooks.json'
import { Note, Notebook, NoteWithoutTitleAndNotebook } from './types'

interface StateProps {
  notes: Note[]
  notebooks: Notebook[]
}

export let state: StateProps = {
  notes: [],
  notebooks: [],
}

function getTitleOfNote(md: string): string {
  const title = md.split('\n')[0]
  // Remove appending ' #'
  const newTitle = title.substring(2)
  return newTitle
}

function getNotebookFromId(
  id: string,
  notebooks: Notebook[]
): string | undefined {
  const notebook = notebooks.find((notebook) => notebook.id === id)
  return notebook?.name
}

export function loadNotes(props?: {
  notes: NoteWithoutTitleAndNotebook[]
  notebooks: Notebook[]
}): void {
  // If not, get sample note from fs
  if (!props) {
    const newNotes: Note[] = defaultNotes.map((note) => {
      const title = getTitleOfNote(note.text)
      const notebook = getNotebookFromId(note.notebookId, defaultNotebooks)
      return { title, notebook, ...note }
    })
    state.notes = newNotes
    state.notebooks = defaultNotebooks
  } else {
    const { notes, notebooks } = props
    // else set state to props
    state.notebooks = notebooks
    const newNotes: Note[] = notes.map((note) => {
      const title = getTitleOfNote(note.text)
      const notebook = getNotebookFromId(note.notebookId, notebooks)
      return { title, notebook, ...note }
    })
    state.notes = newNotes
  }
}

export function addNewNoteToState(note: NoteWithoutTitleAndNotebook): void {
  const newNote = {
    title: '',
    notebook: 'Notes',
    ...note,
  }
  state.notes.push(newNote)
}

export function saveNotes(val: string, id: string) {
  const newNotes = state.notes.map((note) => {
    if (note.id === id) {
      return {
        ...note,
        text: val,
      }
    } else return note
  })
  state.notes = newNotes
}

export function starNote(id: string) {
  const newNotes = state.notes.map((note) => {
    if (note.id === id) {
      return {
        ...note,
        favorite: !note.favorite,
      }
    } else return note
  })
  state.notes = newNotes
}

export function deleteNote(id: string) {
  const newNotes = state.notes.filter((note) => note.id !== id)
  state.notes = newNotes
}
