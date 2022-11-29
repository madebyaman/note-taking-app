import Note from './Note'
import { Notebook } from '../types'

class NotebookView extends Note<Notebook[]> {
  _parentElement = document.querySelector('ul.note-books')

  render(data: Notebook[]) {
    if (data.length) {
      this._data = data
    }
    const markup = this.#generateMarkup()
    this._clear()
    this._parentElement?.insertAdjacentHTML('afterbegin', markup)
  }

  addEventHandler(handler: (id: string) => void) {
    const allNotebooks = document.querySelectorAll('.notebook')
    allNotebooks.forEach((notebook) => {
      const id = notebook.getAttribute('data-notebookid')
      if (!id) {
        return console.error('ID not found for the notebook', notebook)
      }
      notebook.addEventListener('click', () => {
        this.#removeActiveClass()
        notebook.classList.add('active')
        handler(id)
      })
    })
  }

  addEventHandlerToNotes(handler: () => void) {
    const notesCategory = document.querySelector('li.category-notes')
    if (notesCategory) {
      notesCategory.addEventListener('click', () => {
        this.#removeActiveClass()
        notesCategory.classList.add('active')
        handler()
      })
    }
  }

  addEventHandlerToFavorite(handler: () => void) {
    const favoriteCategory = document.querySelector('li.category-favorite')
    if (favoriteCategory) {
      favoriteCategory.addEventListener('click', () => {
        this.#removeActiveClass()
        favoriteCategory.classList.add('active')
        handler()
      })
    }
  }

  addEventHandlerToTrash(handler: () => void) {
    const trashCategory = document.querySelector('li.category-trash')
    if (trashCategory) {
      trashCategory.addEventListener('click', () => {
        this.#removeActiveClass()
        trashCategory.classList.add('active')
        handler()
      })
    }
  }

  #removeActiveClass() {
    const category = document.querySelectorAll('.category')
    category.forEach((cat) => cat.classList.remove('active'))
    const allNotebooks = document.querySelectorAll('.notebook')
    allNotebooks.forEach((notebook) => {
      notebook.classList.remove('active')
    })
  }

  #generateMarkup() {
    if (!this._data) return ''
    return this._data
      .map((notebook) => this.#generateNotebookMarkup(notebook))
      .join('')
  }

  #generateNotebookMarkup({ id, name }: Notebook) {
    return `
            <li class="notebook" data-notebookid="${id}">
              <button>
                <span class="notebook__icon icon gray">
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
                <span class="notebook__name">${name}</span>
              </button>
            </li>
    `
  }
}

export default new NotebookView()
