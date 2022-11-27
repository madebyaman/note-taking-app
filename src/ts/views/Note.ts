class Note<T> {
  _parentElement?: Element | null
  _data?: T

  _clear() {
    if (this && this._parentElement) {
      this._parentElement.innerHTML = ''
    }
  }
}

export default Note
