import marked from 'marked'

async function getLocalNotes(url) {
  const res = await fetch(url)
  const notes = await res.json()
  return notes
}

function getTitleFromNote(note) {
  const title = note.split('\n')[0]
  // Remove appending ' #'
  const newTitle = title.substring(2)
  return newTitle
}

function getNotebookFromId(id, notebooks) {
  return notebooks.find((notebook) => notebook.id === id)
}

function renderNote(title, id, notebook) {
  const article = document.createElement('article')
  article.classList.add('notes__container-note')
  article.dataset.id = id
  const h4 = document.createElement('h4')
  h4.textContent = title
  article.appendChild(h4)
  const categoryContainer = document.createElement('div')
  categoryContainer.classList.add('notes__container-note-category')
  categoryContainer.innerHTML = `
              <span class="icon">
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
              <span class="category-name">${notebook.name}</span>
  `
  article.appendChild(categoryContainer)
  return article
}

const notes = await getLocalNotes('./notes.json')
const notebooks = await getLocalNotes('./notebooks.json')

// Step 1: Title and note
notes.forEach((note) => {
  const getTitle = getTitleFromNote(note.note)
  const getNotebook = getNotebookFromId(note.notebook, notebooks)
  const article = renderNote(getTitle, note.id, getNotebook)
  const parentNode = document.querySelector('.notes__container-notes')
  parentNode?.appendChild(article)
})

// Event handlers in note list
const noteList = document.querySelectorAll('.notes__container-note')

function removeClassFromNodes(nodes, className) {
  nodes.forEach((node) => {
    node.classList.remove(className)
  })
}

function returnPreview(notes, id) {
  const activeNote = notes.find((note) => note.id === id)
  return marked.parse(activeNote.note)
}

function renderPreview(html) {
  const div = document.createElement('div')
  div.classList.add('notes-browser__preview')
  div.innerHTML = html
  return div
}

function addClass(el, className) {
  el.classList.add(className)
}

function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

noteList.forEach((note) => {
  note.addEventListener('click', () => {
    removeClassFromNodes(noteList, 'active')
    addClass(note, 'active')
    const preview = returnPreview(notes, note.getAttribute('data-id'))
    const previewHtml = renderPreview(preview)
    const parentDiv = document.querySelector('.notes-browser')
    removeAllChildren(parentDiv)
    parentDiv?.appendChild(previewHtml)
  })
})
