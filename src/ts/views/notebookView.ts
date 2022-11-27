import Note from './Note'

class NotebookView extends Note<string> {
  render(data: string) {
    this._data = data
    const markup = this.#generateMarkup()
    this._clear()
    this._parentElement?.insertAdjacentHTML('afterbegin', markup)
  }

  #generateMarkup() {
    return ''
  }
}
