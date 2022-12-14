import Note from './Note'
import { Note as NoteType, Notebook } from '../types'
import svg from '../../img/empty-note.svg'
import marked from 'marked'

type NoteProps =
  | {
      type: 'RENDER_EMPTY'
    }
  | {
      type: 'RENDER_PREVIEW' | 'RENDER_EDITOR'
      data: NoteType
      recoverNoteHandler: (id: string) => void
      notebooks: Notebook[]
    }

class NoteView extends Note<NoteType> {
  _parentElement = document.querySelector('.notes-browser')
  #type: 'RENDER_PREVIEW' | 'RENDER_EDITOR' | 'RENDER_EMPTY'

  addSaveHandler(
    saveHandler: (
      val: string,
      id: string,
      notebookId: string | undefined
    ) => void
  ) {
    const selectedOption = this._data?.notebookId
      ? document.querySelector(`option[value="${this._data?.notebookId}"]`)
      : null
    if (selectedOption && selectedOption instanceof HTMLOptionElement) {
      selectedOption.selected = true
    }
    const saveButton = document.querySelector('button.save')
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        if (!this._data) return console.error('No data passed')
        const selectEl = document.getElementById('change-notebook')
        if (selectEl instanceof HTMLSelectElement) {
          saveHandler(
            this._data?.text || '',
            this._data.id,
            selectEl.value || undefined
          )
        }
      })
    }
  }

  #addRecoverNoteHandler(handler: (id: string) => void) {
    const button = document.querySelector('button.recover-note__button')
    if (button && this._data) {
      const { id } = this._data
      button.addEventListener('click', () => handler(id))
    }
  }

  #addInputHandlerToTextarea() {
    const textarea = document.getElementById('notes-editor')
    if (textarea instanceof HTMLTextAreaElement) {
      textarea?.addEventListener('input', (e) => {
        if (e.target instanceof HTMLTextAreaElement) {
          if (this._data) {
            this._data.text = e.target.value
          }
        }
      })
    }
  }

  addStarHandler(handler: (id: string) => void) {
    const starButton = document.querySelector('button.star')
    if (this._data) {
      const id = this._data.id
      starButton?.addEventListener('click', () => handler(id))
    }
  }

  addDeleteHandler(handler: (id: string) => void) {
    const deleteButton = document.querySelector('button.delete')
    if (this._data) {
      const id = this._data.id
      deleteButton?.addEventListener('click', () => handler(id))
    }
  }

  #toggleEditingMode() {
    if (this.#type === 'RENDER_PREVIEW') {
      // flip the mode
      this.#renderEditorMode()
      this.#type = 'RENDER_EDITOR'
    } else if (this.#type === 'RENDER_EDITOR') {
      this.#renderPreviewMode()
      this.#type = 'RENDER_PREVIEW'
    }
  }

  #addEventHandlerToToggleEditingMode() {
    const icon = document.querySelector('button.preview-editor')
    if (icon) {
      icon.addEventListener('click', () => this.#toggleEditingMode())
    }
  }

  #addOptionsToSelectNotebook(notebooks: Notebook[]): void {
    const markup = notebooks
      .map((notebook) => {
        const name = notebook.name
        return `<option value="${notebook.id}">${
          name.charAt(0).toUpperCase() + notebook.name.slice(1)
        }</option>`
      })
      .join('')
    const selectEl = document.getElementById('change-notebook')
    if (selectEl) selectEl.insertAdjacentHTML('afterbegin', markup)
  }

  #renderIcons() {
    const markup = `
<div class="flex">
<button class="icon star" title="Add to favorites"></button>
            <button class="icon preview-editor">
            </button>
            <button class="delete icon" title="Delete Note">
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
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
            </div>
            <div class="flex">
              <label for="change-notebook">Notebook:</label>
              <select id="change-notebook">
              <option value="">Select a notebook</option>
              </select>
              <button class="save">Save</button>
            </div>
    `
    const parentEl = document.querySelector('.note-settings-bar')
    if (!parentEl) return
    parentEl.innerHTML = markup
  }

  renderStarIcon(favorite: boolean) {
    let iconMarkup: string
    let title: string
    if (favorite) {
      iconMarkup = this.#starFilledIcon()
      title = 'Unfavorite'
    } else {
      iconMarkup = this.#starOutlineIcon()
      title = 'Add to favorites'
    }
    const parentEl = document.querySelector('button.star.icon')
    if (parentEl instanceof HTMLButtonElement) {
      parentEl.title = title
    }
    if (!parentEl) return
    parentEl.innerHTML = ''
    parentEl?.insertAdjacentHTML('afterbegin', iconMarkup)
  }

  #renderPreviewOrCodeIcon() {
    let markupIcon: string
    let title: string
    if (this.#type === 'RENDER_PREVIEW') {
      markupIcon = this.#previewIcon()
      title = 'View markdown'
    } else if (this.#type === 'RENDER_EDITOR') {
      markupIcon = this.#codeIcon()
      title = 'Show preview'
    } else {
      throw new Error('Editor is empty')
    }
    const parentEl = document.querySelector('button.preview-editor')
    if (parentEl instanceof HTMLButtonElement) {
      parentEl.title = title
    }
    if (!parentEl) return
    parentEl.innerHTML = ''
    parentEl.insertAdjacentHTML('afterbegin', markupIcon)
  }

  #clearIcons() {
    const noteSettingsBar = document.querySelector('.note-settings-bar')
    if (noteSettingsBar) {
      noteSettingsBar.innerHTML = ''
    }
  }

  #renderPreviewMode() {
    const markup = this.#generateMarkup()
    this.#renderPreviewOrCodeIcon()
    this._clear()
    this._parentElement?.insertAdjacentHTML('afterbegin', markup)
  }

  #renderEditorMode() {
    const markup = this.#generateEditorMarkup()
    this.#renderPreviewOrCodeIcon()
    this._clear()
    this._parentElement?.insertAdjacentHTML('afterbegin', markup)
    // Add event handler to editor
    this.#addInputHandlerToTextarea()
  }

  #renderEmpty() {
    const markup = this.#renderEmptyMessage()
    this.#clearIcons()
    this._clear()
    this._parentElement?.insertAdjacentHTML('afterbegin', markup)
  }

  #renderDeletedNoteMessage() {
    const mainContent = document.querySelector('div.recover-note')
    const markup = this.#generateMarkupToRecoverTrashNoteMessage()
    if (this._data?.inTrash) {
      mainContent?.insertAdjacentHTML('afterbegin', markup)
    } else if (mainContent) {
      mainContent.innerHTML = ''
    }
  }

  #hideBottomActionBar() {
    const bottomBar = document.querySelector('.note-settings-bar')
    if (bottomBar) bottomBar.innerHTML = ''
  }

  render(props: NoteProps) {
    this.#type = props.type
    if (props.type === 'RENDER_EMPTY') {
      this._data = undefined
      this.#renderEmpty()
      this.#renderDeletedNoteMessage()
    } else {
      this.#renderIcons()
      this._data = props.data
      this.renderStarIcon(props.data.favorite)
      if (props.type === 'RENDER_PREVIEW') {
        this.#renderPreviewMode()
      } else {
        this.#renderEditorMode()
      }
      this.#addEventHandlerToToggleEditingMode()
      if (this._data.inTrash) {
        this.#renderDeletedNoteMessage()
        this.#addRecoverNoteHandler(props.recoverNoteHandler)
        this.#hideBottomActionBar()
        return
      }
      this.#addOptionsToSelectNotebook(props.notebooks)
    }
  }

  #previewIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>`
  }

  #codeIcon() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
    `
  }

  #starFilledIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
    <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
  </svg>`
  }

  #starOutlineIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>`
  }

  #generateEditorMarkup() {
    return `
      <textarea class="notes-editor" id="notes-editor" rows="30">${
        this._data?.text || '# New Note'
      }</textarea>
    `
  }

  #renderEmptyMessage() {
    return `
        <div class="notes-browser__empty">
          <div>
            <img
              src="${svg}"
              alt="An illustration of note with no content"
            />
            <p>Select a note to view</p>
          </div>
        </div>
    `
  }

  #generateMarkup() {
    return `
      <div class="notes-browser__preview">
        ${marked(this._data?.text || '', { sanitize: true })}
      </div>
    `
  }

  #generateMarkupToRecoverTrashNoteMessage() {
    return `<p>Want to recover this note?</p><button class="recover-note__button">Recover</button>`
  }
}

export default new NoteView()
