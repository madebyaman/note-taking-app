import Note from './Note'
import svg from '../../img/empty-note.svg'

class NoteView extends Note<string> {
  _parentElement = document.querySelector('.notes-browser')

  render(data?: string) {
    this._data = data
    const markup = this.#generateMarkup()
    this._clear()
    this._parentElement?.insertAdjacentHTML('afterbegin', markup)
  }

  #generateEmptyMessage() {
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
    if (!this._data) return this.#generateEmptyMessage()
    return `
      <div class="notes-browser__preview">
        ${this._data}
      </div>
    `
  }
}

export default new NoteView()
