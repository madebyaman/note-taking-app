import Note from './Note'
import svg from '../../img/empty-note.svg'

type Render =
  | {
      type: 'RENDER_EMPTY'
    }
  | {
      type: 'RENDER_PREVIEW' | 'RENDER_EDITOR'
      data: string
      id: string
      favorite: boolean
    }

class NoteView extends Note<string> {
  _parentElement = document.querySelector('.notes-browser')
  _id: string

  addSaveHandler(handler: () => void) {
    const saveButton = document.querySelector('button.save')
    saveButton?.addEventListener('click', handler)
  }

  addStarHandler(handler: (id: string) => void) {
    const starButton = document.querySelector('button.star')
    starButton?.addEventListener('click', () => handler(this._id))
  }

  addDeleteHandler(handler: (id: string) => void) {
    const deleteButton = document.querySelector('button.delete')
    deleteButton?.addEventListener('click', () => handler(this._id))
  }

  #renderIcons() {
    const markup = `
<button class="icon star"></button>
            <button class="icon preview-editor">
            </button>
            <button class="save icon">
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
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>
            <button class="delete icon">
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
    `
    const parentEl = document.querySelector('.note-settings-bar')
    if (!parentEl) return
    parentEl.innerHTML = markup
  }

  renderStarIcon(favorite: boolean) {
    let iconMarkup: string
    if (favorite) {
      iconMarkup = this.#starFilledIcon()
    } else {
      iconMarkup = this.#starOutlineIcon()
    }
    const parentEl = document.querySelector('button.star.icon')
    if (!parentEl) return
    parentEl.innerHTML = ''
    parentEl?.insertAdjacentHTML('afterbegin', iconMarkup)
  }

  #renderPreviewOrCodeIcon(preview: boolean) {
    let markupIcon: string
    if (preview) {
      markupIcon = this.#previewIcon()
    } else {
      markupIcon = this.#codeIcon()
    }
    const parentEl = document.querySelector('button.preview-editor')
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

  render(props: Render) {
    let markup: string
    if (props.type === 'RENDER_EMPTY') {
      markup = this.#renderEmptyMessage()
      this.#clearIcons()
    } else {
      this.#renderIcons()
      this._data = props.data
      this._id = props.id
      this.renderStarIcon(props.favorite)
      if (props.type === 'RENDER_PREVIEW') {
        markup = this.#generateMarkup()
        this.#renderPreviewOrCodeIcon(true)
        // Render preview icon
      } else {
        markup = this.#generateEditorMarkup()
        this.#renderPreviewOrCodeIcon(false)
        // render editor icon
      }
    }
    this._clear()
    this._parentElement?.insertAdjacentHTML('afterbegin', markup)
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
      <textarea class="notes-browser__editor" id="notes-editor">${
        this._data || '# New Note'
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
        ${this._data}
      </div>
    `
  }
}

export default new NoteView()
