import Note from './Note'
import { Notebook } from '../types'

type EventHandlerToNotebook = {
  renameHandler: (val: string, id: string) => void
  deleteHandler: (id: string) => void
  openHandler: (id: string) => void
}

class NotebookView extends Note<Notebook[]> {
  _parentElement = document.querySelector('ul.note-books')

  #addActiveClass(id?: string) {
    this.#removeActiveClass()
    let li: HTMLElement | null
    if (id === 'all' || !id) {
      li = document.querySelector('li.all-notes')
    } else if (id === 'favorites') {
      li = document.querySelector('li.favorite-notes')
    } else if (id === 'trash') {
      li = document.querySelector('li.trash-notes')
    } else {
      li = document.querySelector(`li[data-notebookid='${id}'`)
    }
    if (li) {
      li.classList.add('active')
    }
  }

  render(data: Notebook[], activeNotebook?: string) {
    this.#hideNotebooks()
    if (!data.length) {
      this._clear()
      this.#addActiveClass(activeNotebook)
      return
    }
    this._data = data
    const markup = this.#generateMarkup()
    this._clear()
    this._parentElement?.insertAdjacentHTML('afterbegin', markup)
    this.#addActiveClass(activeNotebook)
  }

  /**
   * Hide Notebooks
   */
  #hideNotebooks() {
    const button = document.querySelector('.hide-notebooks-button-icon')
    const notebookSection = document.querySelector('.notebooks-section')
    button?.addEventListener('click', () => {
      notebookSection?.classList.toggle('hide-notebooks')
    })
  }

  // Add new notebook logic
  addEventHandlerToAddNotebookButton(handler: (name: string) => void): void {
    const addButton = document.querySelector('button.add-notebook')
    if (addButton && addButton instanceof HTMLButtonElement) {
      addButton.addEventListener('click', () => {
        const form = this.#generateAddNotebookFormMarkup(handler)
        const parenEl = document.querySelector('.notebooks-section')
        if (parenEl) {
          parenEl.appendChild(form)
        }
      })
    }
  }

  #generateAddNotebookFormMarkup(
    handler: (name: string) => void
  ): HTMLFormElement {
    const form = document.createElement('form')
    form.classList.add('add-notebook__form')
    const input = document.createElement('input')
    input.classList.add('new-notebook-input')
    input.type = 'text'
    input.name = 'new-notebook'
    input.placeholder = 'Notebook Name'
    input.focus()
    form.appendChild(input)
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      handler(input.value)
      input.value = ''
      form.remove()
    })
    return form
  }

  // Open notebook logic
  #openNotebookEventHandler(
    li: HTMLElement | null,
    handler: (id: string) => void
  ) {
    if (!li) {
      return console.error('No list item to open notebook')
    }
    const id = li?.getAttribute('data-notebookid')
    if (id) {
      handler(id)
    }
  }

  // Rename notebook name logic
  #editNotebookHandler(
    li: HTMLElement | null,
    handler: (val: string, id: string) => void
  ) {
    if (!li) {
      return console.error('No list item')
    }
    const el = li.querySelector('.notebook__name')
    let val: string | null = ''
    if (el) {
      val = el.textContent
      el.remove()
      li.innerHTML = ''
    }
    const form = document.createElement('form')
    form.classList.add('notebook__name-form')
    const input = document.createElement('input')
    input.name = 'notebook-name'
    input.classList.add('notebook__name-input')
    input.value = val || ''
    form.appendChild(input)
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const id = li.getAttribute('data-notebookid')
      if (!id) return
      handler(input.value, id)
    })
    li.insertAdjacentElement('beforebegin', form)
  }

  // Delete notebook logic
  #addDeleteNotebookHandler(
    li: HTMLElement | null,
    handler: (id: string) => void
  ) {
    if (!li) {
      return console.error('No li item to get id')
    }
    const id = li.getAttribute('data-notebookid')
    if (!id) return console.error('No id')
    handler(id)
  }

  // Event handlers to notebook
  addEventHandlersToNotebook(props: EventHandlerToNotebook) {
    const parentEl = document.querySelector('ul.note-books')
    this.#addEventHandlerToNotes(props.openHandler)
    this.#addEventHandlerToFavorite(props.openHandler)
    this.#addEventHandlerToTrash(props.openHandler)
    parentEl?.addEventListener('click', (e) => {
      e.stopPropagation()
      if (e.target instanceof HTMLElement || e.target instanceof SVGElement) {
        const closestButton = e.target.closest('button')
        const closestLi = e.target.closest('li')
        console.log(closestButton)
        if (closestButton?.classList.contains('notebook__button')) {
          // Run open notebook handler
          this.#openNotebookEventHandler(closestLi, props.openHandler)
        } else if (closestButton?.classList.contains('notebook__rename')) {
          // Run rename notebook handler
          this.#editNotebookHandler(closestLi, props.renameHandler)
        } else if (closestButton?.classList.contains('notebook__delete')) {
          // Run delete notebook handler
          this.#addDeleteNotebookHandler(closestLi, props.deleteHandler)
        }
        // Add handlers to open all notes, favorites and trash
      }
    })
  }

  // Open category like Notes, Favorite logic
  #addEventHandlerToNotes(handler: (id: string) => void) {
    const notesCategory = document.querySelector('li.all-notes')
    if (notesCategory) {
      notesCategory.addEventListener('click', () => {
        handler('all')
      })
    }
  }

  #addEventHandlerToFavorite(handler: (id: string) => void) {
    const favoriteCategory = document.querySelector('li.favorite-notes')
    if (favoriteCategory) {
      favoriteCategory.addEventListener('click', () => {
        handler('favorites')
      })
    }
  }

  #addEventHandlerToTrash(handler: (id: string) => void) {
    const trashCategory = document.querySelector('li.trash-notes')
    if (trashCategory) {
      trashCategory.addEventListener('click', () => {
        handler('trash')
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
