import Note from './Note'
import svg from '../../img/empty-note.svg'
import snarkdown from 'snarkdown'

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

  loadMdEditor() {
    const textare = document.querySelector('#notes-editor')
    textare?.addEventListener('blur', (e) => {
      const value = e.target.value
      this.render({ type: 'RENDER_PREVIEW', data: snarkdown(value) })
    })
  }

  #generateEditorMarkup() {
    return `
      <textarea class="notes-browser__editor" id="notes-editor">${this._data}</textarea>
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
