const fs = require('fs')
const path = require('path')
const axios = require('axios')

const database = require('../utilities/database')
const formatSize = require('../utilities/format-size')
const sortFolderContents = require('../utilities/sort-folder-contents')
const formatTime = require('../utilities/format-time')
const cloudinary = require('../utilities/configure-cloudinary')

async function handleDashboardGet (req, res) {
  try {
    const homeFolderId = await database.findHomeFolderId(req.user.id)
    res.redirect(`/dashboard/folders/${homeFolderId}`)
  } catch (error) {
    console.error('Error redirecting to dashboard:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function handleUploadPost (req, res) {
  const { folderId } = req.params
  const filePath = path.join(__dirname, '..', req.file.path)
  const { originalname, size } = req.file

  try {
    const filenameExists = await database.checkFilenameExist(
      originalname,
      folderId
    )

    if (!filenameExists) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'auto'
      })
      await database.createFile(
        originalname,
        result.secure_url,
        folderId,
        size
      )
    }

    fs.unlinkSync(filePath)

    res.redirect(`/dashboard/folders/${folderId}`)
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function handleFolderGet (req, res) {
  try {
    const { folderId } = req.params
    const folder = await database.findFolder(folderId)

    // Create breadcrumb path
    const breadcrumbs = []
    let currentFolder = folder
    while (currentFolder) {
      breadcrumbs.unshift({
        name: currentFolder.name,
        id: currentFolder.id
      })
      currentFolder = currentFolder.parent
    }

    // Format file sizes and updatedAt
    if (folder.files.length) {
      folder.files = folder.files.map((file) => ({
        ...file,
        formattedSize: formatSize(file.size),
        formattedUpdatedAt: formatTime(file.updatedAt)
      }))
    }

    if (folder.subfolders.length) {
      folder.subfolders = folder.subfolders.map((subfolder) => ({
        ...subfolder,
        formattedUpdatedAt: formatTime(subfolder.updatedAt)
      }))
    }

    const sortedFolder = sortFolderContents(folder)

    res.render('dashboard', {
      title: 'Folder',
      user: req.user,
      folder: sortedFolder,
      breadcrumbs
    })
  } catch (error) {
    console.error('Error finding folder:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function handleCreatePost (req, res) {
  try {
    const { name } = req.body
    const { folderId } = req.params

    const foldernameExists = await database.checkFoldernameExist(
      name,
      folderId
    )

    if (!foldernameExists) {
      await database.createFolder(name, req.user.id, folderId)
    }

    res.redirect(`/dashboard/folders/${folderId}`)
  } catch (error) {
    console.error('Error creating folder:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function handleUpdateGet (req, res) {
  try {
    const { folderId } = req.params
    const folder = await database.findFolder(folderId)
    const parentFolders = await database.findParentFolders(
      req.user.id,
      folderId
    )
    res.render('update', {
      title: 'Update',
      user: req.user,
      formData: {
        name: folder.name,
        parentId: folder.parentId
      },
      folder,
      parentFolders
    })
  } catch (error) {
    console.error('Error updating folder:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function handleUpdatePost (req, res) {
  const { folderId } = req.params
  const { name, parentId } = req.body

  try {
    const updatedFolder = await database.updateFolder(folderId, name, parentId)
    res.redirect(`/dashboard/folders/${updatedFolder.id}`)
  } catch (error) {
    console.error('Error updating folder:', error)
    res.status(500).redirect(`/dashboard/folders/${folderId}/update`)
  }
}

async function handleDeleteGet (req, res) {
  const { folderId } = req.params
  try {
    const folder = await database.findFolder(folderId)
    res.render('delete', { title: 'Delete', user: req.user, folder })
  } catch (error) {
    res.status(500).send('Internal server error')
  }
}

async function handleDeletePost (req, res) {
  const { folderId } = req.params
  try {
    const homeFolderId = await database.findHomeFolderId(req.user.id)
    const folder = await database.findFolder(folderId)
    if (folderId !== homeFolderId) {
      await database.deleteFolder(folderId)
    }
    res.redirect(`/dashboard/folders/${folder.parentId}`)
  } catch (error) {
    console.error('Error deleting folder:', error)
    res.status(500).redirect('/dashboard')
  }
}

async function handleFileGet (req, res) {
  const { fileId } = req.params
  const file = await database.findFile(fileId)

  try {
    const formattedFile = {
      ...file,
      formattedSize: formatSize(file.size),
      formattedCreatedAt: formatTime(file.createdAt)
    }

    res.render('file', { title: 'File', user: req.user, file: formattedFile })
  } catch (error) {
    console.error('Error finding file:', error)
    res.redirect(`/dashboard/folders/${file.folderId}`)
  }
}

async function handleDownloadGet (req, res) {
  const { fileId } = req.params
  const file = await database.findFile(fileId)

  try {
    // Use Axios to stream the file from Cloudinary
    const response = await axios.get(file.path, { responseType: 'stream' })

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`)
    res.setHeader('Content-Type', response.headers['content-type'])

    // Stream the file to the response
    response.data.pipe(res)
  } catch (error) {
    console.error('Error downloading file:', error)
    res.redirect(`/dashboard/folders/${file.folderId}`)
  }
}

async function handleShareGet (req, res) {
  const { folderId } = req.params
  try {
    const folder = await database.findFolder(folderId)
    res.render('share', {
      title: 'Share',
      user: req.user,
      folder,
      shareableUrl: ''
    })
  } catch (error) {
    console.error('Error finding file:', error)
    res.redirect(`/dashboard/folders/${folderId}`)
  }
}

async function handleSharePost (req, res) {
  const { folderId } = req.params
  const { duration } = req.body

  try {
    const folder = await database.findFolder(folderId)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + +duration)

    // Create the share link
    const shareLink = await database.createShareLink(folderId, expiresAt)
    const shareLinkId = shareLink.id

    // Build the shareable URL dynamically
    const protocol = req.protocol // 'http' or 'https'
    const host = req.get('host') // e.g., 'yourapp.com'
    const shareableUrl = `${protocol}://${host}/share/${shareLinkId}`

    // Render the EJS view with the generated link
    res.render('share', {
      title: 'Share',
      user: req.user,
      folder,
      shareableUrl
    })
  } catch (error) {
    console.error('Error creating share link:', error)
    res.status(500).send('Internal server error')
  }
}

module.exports = {
  handleDashboardGet,
  handleUploadPost,
  handleFolderGet,
  handleCreatePost,
  handleUpdateGet,
  handleUpdatePost,
  handleDeleteGet,
  handleDeletePost,
  handleFileGet,
  handleDownloadGet,
  handleShareGet,
  handleSharePost
}
