import Note from './Note'
import { Notebook } from '../types'

class NotebookView extends Note<Notebook[]> {
  _parentElement = document.querySelector('ul.note-books')

  render(data: Notebook[]) {
    if (!data.length) {
      this._clear()
      return
    }
    this._data = data
    const markup = this.#generateMarkup()
    this._clear()
    this._parentElement?.insertAdjacentHTML('afterbegin', markup)
  }

  addEventHandler(handler: (id: string) => void) {
    const allNotebooks = document.querySelectorAll('.notebook__button')
    allNotebooks.forEach((notebook) => {
      const id = notebook.closest('li')?.getAttribute('data-notebookid')
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

  onRename(handler: (name: string, id: string) => void) {
    const form = document.querySelector('form.notebook__name-form')
    const input = document.querySelector('input.notebook__name-input')
    if (form && input && input instanceof HTMLInputElement) {
      form.addEventListener('submit', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const notebook = input.closest('li')
        if (!notebook) return
        const id = notebook.getAttribute('data-notebookid')
        if (!id) return
        handler(input.value, id)
      })
    }
  }

  addEditNotebookHandler(handler: () => void) {
    const editButton = document.querySelector('.notebook__rename')
    editButton?.addEventListener('click', (e) => {
      e.stopPropagation()
      const parentEl = document.querySelector('.notebook__button')
      const el = document.querySelector('.notebook__name')
      let val: string | null = ''
      if (el) {
        val = el.textContent
        el.remove()
      }
      const form = document.createElement('form')
      form?.classList.add('notebook__name-form')
      form.innerHTML = `<input type="text" name="notebook-name" class="notebook__name-input" value="${
        val || ''
      }" />`
      parentEl?.appendChild(form)
      if (form.firstChild && form.firstChild instanceof HTMLInputElement) {
        form.firstChild?.focus()
      }
      handler()
    })
  }

  addDeleteNotebookHandler(handler: (id: string) => void) {
    const deleteButton = document.querySelector('.notebook__delete')
    if (!deleteButton) {
      return console.error('No delete button')
    }
    deleteButton.addEventListener('click', () => {
      const li = deleteButton.closest('li')
      if (!li) {
        return console.error('No li item to get id')
      }
      const id = li.getAttribute('data-notebookid')
      if (!id) return console.error('No id')
      handler(id)
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
              <button class="notebook__button">
                <span class="notebook__icon icon">
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
              <button class="notebook__rename icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
              </button>
              <button class="notebook__delete icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </li>
    `
  }
}

export default new NotebookView()
