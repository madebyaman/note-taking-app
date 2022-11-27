import notes from '../notes.json'
import notebooks from '../notebooks.json'

type StateProps = {
  notes: {
    notebookId: string
    favorite: boolean
    createdDate: string
    text: string
    id: string
  }[]
  notebooks: {
    id: string
    name: string
  }[]
}

export let state: StateProps = {
  notes: [],
  notebooks: [],
}

export async function loadNotes(props?: StateProps) {
  // If not, get sample note from fs
  if (!props) {
    state.notes = notes
    state.notebooks = notebooks
  } else {
    // else set state to props
    state = props
  }
}
