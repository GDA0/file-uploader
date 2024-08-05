function sortFolderContents (folder) {
  // Clone the folder to avoid mutating the original object
  const sortedFolder = { ...folder }

  // Sort subfolders by updatedAt
  sortedFolder.subfolders.sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  )

  // Sort files by updatedAt
  sortedFolder.files.sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  )

  return sortedFolder
}

module.exports = sortFolderContents
