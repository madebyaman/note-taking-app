import Note from './Note'
import { Note as Notetype } from '../types'

class NotesView extends Note<Notetype[]> {
  _parentElement = document.querySelector('.notes__container-notes')

  addHandlerForNewNote(handler: () => void) {
    document.querySelector('.add-new-note')?.addEventListener('click', handler)
  }

  addHandler(handler: (ev: Event) => void) {
    this._parentElement?.addEventListener('click', (e) => handler(e))
  }

  removeActiveClass() {
    const notes = document.querySelectorAll('.notes__container-note')
    notes.forEach((note) => {
      note.classList.remove('active')
    })
  }

  render(data: Notetype[]) {
    this._data = data
    this._clear()
    const markup = this.#generateMarkup()
    this._parentElement?.insertAdjacentHTML('afterbegin', markup)
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
          <article data-noteId="${note.id}" class="notes__container-note">
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
          </article>
    `
  }
}

export default new NotesView()
