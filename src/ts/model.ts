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

function newNotes() {
  const newNotes: Note[] = defaultNotes.map((note) => {
    const title = getTitleOfNote(note.text)
    const notebook = getNotebookFromId(note.notebookId, defaultNotebooks)
    const inTrash = false
    return { title, notebook, inTrash, ...note }
  })
  return newNotes
}

export async function loadNotes() {
  // If not, get sample note from fs
  try {
    await Promise.all([
      getNotesFromLocalStorage(),
      getNotebooksFromLocalStorage(),
    ]).then(([notes, notebooks]) => {
      state.notes = notes
      state.notebooks = notebooks
    })
  } catch (e) {
    state.notes = newNotes()
    state.notebooks = defaultNotebooks
  }
}

export function addNewDefaultNote(notebookIdToAdd?: string): string {
  let notebook: Notebook | undefined
  if (
    notebookIdToAdd &&
    notebookIdToAdd !== 'all' &&
    notebookIdToAdd !== 'favorites'
  ) {
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
    favorite: notebookIdToAdd === 'favorites' ? true : false,
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
        title: getTitleOfNote(val),
        text: val,
      }
    } else return note
  })
  state.notes = newNotes
  saveToLocalStorage()
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
  saveToLocalStorage()
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
  saveToLocalStorage()
}

export function showFavoriteNotes() {
  return state.notes.filter((note) => note.favorite && !note.inTrash)
}

export function showNotesFromNotebook(id: string) {
  return state.notes.filter((note) => note.notebookId === id && !note.inTrash)
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
  saveToLocalStorage()
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
  saveToLocalStorage()
}

export function addNewNotebook(name: string): string {
  const newNotebook = {
    name,
    id: v4(),
  }

  state.notebooks.push(newNotebook)
  saveToLocalStorage()
  return newNotebook.id
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
  saveToLocalStorage()
}

export function checkIfNotebookIdValid(id: string) {
  return state.notebooks.some((notebook) => notebook.id === id)
}

export function checkIfNoteIdValid(id: string): boolean {
  return state.notes.some((note) => note.id === id && !note.inTrash)
}

export function changeCategoryOfNote(
  noteId: string,
  notebookId: string | undefined
) {
  const notebook = state.notebooks.find(
    (notebook) => notebook.id === notebookId
  )
  if (!notebook) return
  const newNotes = state.notes.map((note) => {
    if (note.id === noteId) {
      return {
        ...note,
        notebook: notebook.name,
        notebookId: notebook.id,
      }
    } else return note
  })
  state.notes = newNotes
  saveToLocalStorage()
}

function saveToLocalStorage() {
  const notes = showAllNotes()
  window.localStorage.setItem('notes', JSON.stringify(notes))
  window.localStorage.setItem('notebooks', JSON.stringify(state.notebooks))
}

async function getNotesFromLocalStorage(): Promise<Note[]> {
  return new Promise((resolve, reject) => {
    const notes = window.localStorage.getItem('notes')
    if (notes) {
      const parsedNotes = JSON.parse(notes)
      resolve(parsedNotes)
    } else reject('No notes')
  })
}

async function getNotebooksFromLocalStorage(): Promise<Notebook[]> {
  return new Promise((resolve, reject) => {
    const notebooks = window.localStorage.getItem('notebooks')
    if (notebooks) {
      const parsedNotebooks = JSON.parse(notebooks)
      resolve(parsedNotebooks)
    } else reject('no notebooks')
  })
}
