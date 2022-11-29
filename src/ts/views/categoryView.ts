class CategoryView {
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
  }
}

export default new CategoryView()
