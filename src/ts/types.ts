export type Note = {
  notebookId: string | null
  notebook: string | undefined
  favorite: boolean
  createdDate: string
  text: string
  id: string
  title: string
}

export type NoteWithoutTitleAndNotebook = Omit<Note, 'title' | 'notebook'>

export type Notebook = {
  id: string
  name: string
}
