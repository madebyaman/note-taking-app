import Note from './Note'
import svg from '../../img/empty-note.svg'

type Render =
  | {
      type: 'RENDER_EMPTY'
    }
  | {
      type: 'RENDER_PREVIEW' | 'RENDER_EDITOR'
      data: string
    }

class NoteView extends Note<string> {
  _parentElement = document.querySelector('.notes-browser')

  render(props: Render) {
    let markup: string
    if (props.type === 'RENDER_EMPTY') {
      markup = this.#renderEmptyMessage()
    } else {
      this._data = props.data
      if (props.type === 'RENDER_PREVIEW') {
        markup = this.#generateMarkup()
      } else {
        markup = this.#generateEditorMarkup()
      }
    }
    this._clear()
    this._parentElement?.insertAdjacentHTML('afterbegin', markup)
  }

  #generateEditorMarkup() {
    return `
          <textarea class="notes-browser__editor" id="notes-editor" cols="33" rows="5">
          ${this._data}
        </textarea>
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
