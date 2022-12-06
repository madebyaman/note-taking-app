import defaultNotes from '../notes.json'
import defaultNotebooks from '../notebooks.json'
import { Note, Notebook, NoteWithoutTitleAndNotebook } from './types'
import { v4 } from 'uuid'

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
      const inTrash = false
      return { title, notebook, inTrash, ...note }
    })
    state.notes = newNotes
    state.notebooks = defaultNotebooks
  } else {
    const { notes, notebooks } = props
    // else set state to props
    state.notebooks = notebooks
    const newNotes: Note[] = notes.map((note) => {
      const title = getTitleOfNote(note.text)
      let notebook
      if (note.notebookId) {
        notebook = getNotebookFromId(note.notebookId, notebooks)
      } else {
        notebook = undefined
      }
      return { title, notebook, ...note }
    })
    state.notes = newNotes
  }
}

export function addNewDefaultNote(notebookIdToAdd?: string): string {
  let notebook: Notebook | undefined
  if (notebookIdToAdd) {
    notebook = state.notebooks.find(
      (notebook) => notebook.id === notebookIdToAdd
    )
  }
  const newNote = {
    title: '',
    notebook: notebook?.name,
    id: v4(),
    text: '',
    notebookId: notebook?.id || null,
    inTrash: false,
    favorite: false,
    createdDate: new Date(Date.now()).toISOString(),
  }
  state.notes.push(newNote)
  return newNote.id
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
  const newNotes = state.notes.map((note) => {
    if (note.id === id) {
      const newNote = {
        ...note,
        inTrash: true,
      }
      return newNote
    } else {
      return note
    }
  })
  state.notes = newNotes
}

export function showFavoriteNotes() {
  return state.notes.filter((note) => note.favorite)
}

export function showNotesFromNotebook(id: string) {
  return state.notes.filter((note) => note.notebookId === id)
}

export function renameNotebook(name: string, id: string) {
  const newNotebooks = state.notebooks.map((notebook) => {
    if (notebook.id === id) {
      return {
        ...notebook,
        name,
      }
    } else return notebook
  })

  const newNotes = state.notes.map((note) => {
    if (note.notebookId === id) {
      return { ...note, notebook: name }
    } else return note
  })

  state.notebooks = newNotebooks
  state.notes = newNotes
}

export function deleteNotebook(id: string) {
  // first remove notes id of this notebook.
  // what about trashed note?
  const newNotes = state.notes.map((note) => {
    if (note.notebookId === id) {
      return {
        ...note,
        notebookId: null,
        notebook: undefined,
      }
    } else return note
  })

  state.notes = newNotes

  // Next, delete notebook
  const newNotebooks = state.notebooks.filter((notebook) => notebook.id !== id)
  state.notebooks = newNotebooks
}

export function addNewNotebook(name: string) {
  const newNotebook = {
    name,
    id: v4(),
  }

  state.notebooks.push(newNotebook)
}

export function showTrashedNotes(): Note[] {
  return state.notes.filter((note) => note.inTrash)
}

export function showAllNotes(): Note[] {
  return state.notes.filter((note) => !note.inTrash)
}

export function recoverNote(id: string): void {
  const newNotes = state.notes.map((note) => {
    if (note.id === id) {
      return {
        ...note,
        inTrash: false,
      }
    } else return note
  })
  state.notes = newNotes
}

export function checkNotebook(id: string) {
  return state.notebooks.some((notebook) => notebook.id === id)
}
