import Note from './Note'
import { Note as Notetype } from '../types'

class NotesView extends Note<Notetype[]> {
  _parentElement = document.querySelector('.notes__container-notes')

  addClickEventHandlerToOpen(handler: (id: string) => void) {
    const notesListContainer = document.querySelector('.notes__container-notes')
    notesListContainer?.addEventListener('click', (e) => {
      e.stopPropagation()
      if (e.target instanceof HTMLElement) {
        const closestNote = e.target.closest('article')
        const id = closestNote?.getAttribute('data-noteid')
        if (id) {
          this.#addActiveClassToNote(id)
          handler(id)
        }
      }
    })
  }

  addHandlerForNewNote(handler: () => void) {
    document.querySelector('.add-new-note')?.addEventListener('click', handler)
  }

  #addActiveClassToNote(id: string) {
    this.#removeActiveClass()
    const note = document.querySelector(`article[data-noteid="${id}"]`)
    if (note) {
      note.classList.add('active')
    }
  }

  #removeActiveClass() {
    const notes = document.querySelectorAll('.notes__container-note')
    notes.forEach((note) => {
      note.classList.remove('active')
    })
  }

  render(data: Notetype[], activeNote?: string) {
    this._data = data
    this._clear()
    const markup = this.#generateMarkup()
    this._parentElement?.insertAdjacentHTML('afterbegin', markup)
    if (activeNote) {
      this.#addActiveClassToNote(activeNote)
    } else {
      this.#removeActiveClass()
    }
  }

  #generateMarkup() {
    if (this._data?.length) {
      return this._data.map((note) => this.#generateNotesMarkup(note)).join('')
    } else {
      return ''
    }
  }

  #generateNotesMarkup(note: Notetype) {
    return `
          <article data-noteId="${
            note.id
          }" class="notes__container-note notes-container__grid">
            <div class="icon notes-container__grid-item">
              ${
                note.favorite
                  ? `
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                `
                  : ''
              }
            </div>
            <div class="notes-container__grid-item">
            <h4>${note.title ? note.title : 'New Note'}</h4>
            <div class="notes__container-note-category">
              <span class="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                    />
                  </svg>
              </span>
              ${
                note.notebook
                  ? `<span class="category-name">${note.notebook}</span>`
                  : ''
              }
            </div>
            </div>
          </article>
    `
  }
}

export default new NotesView()
