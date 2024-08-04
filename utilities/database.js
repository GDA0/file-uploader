const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createUser(firstName, lastName, username, password) {
  try {
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        password,
      },
    });

    return user;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
}

async function checkUsernameExists(username) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    return user !== null; // returns true if user exists, false otherwise
  } catch (error) {
    console.error("Error checking username existence:", error);
    throw error;
  }
}

async function findUser(method, value) {
  try {
    let user;

    if (method === "username") {
      user = await prisma.user.findUnique({
        where: { username: value },
      });
    } else if (method === "id") {
      user = await prisma.user.findUnique({
        where: { id: value },
      });
    } else {
      throw new Error('Invalid method. Use "username" or "id".');
    }

    return user;
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
}

async function createHomeFolder(userId) {
  try {
    await prisma.folder.create({
      data: {
        name: "Home",
        userId,
      },
    });
  } catch (error) {
    console.error("Error creating default folder:", error);
    throw error;
  }
}

async function findFolder(folderId) {
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },
      include: {
        subfolders: true,
        files: true,
        parent: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return folder;
  } catch (error) {
    console.error(`Error finding folder with ID ${folderId}:`, error);
    throw error;
  }
}

async function createFile(name, path, folderId, size) {
  try {
    await prisma.file.create({
      data: {
        name,
        path,
        folderId,
        size,
      },
    });
  } catch (error) {
    console.error("Error creating file:", error);
    throw error;
  }
}

async function createFolder(name, userId, parentId) {
  try {
    await prisma.folder.create({
      data: {
        name,
        userId,
        parentId,
      },
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
}

async function checkFilenameExist(name, folderId) {
  try {
    const file = await prisma.file.findFirst({
      where: { name, folderId },
    });
    return file !== null;
  } catch (error) {
    console.error("Error checking file existence:", error);
    throw error;
  }
}

async function checkFoldernameExist(name, parentId) {
  try {
    const folder = await prisma.folder.findFirst({
      where: { name, parentId },
    });
    return folder !== null;
  } catch (error) {
    console.error("Error checking folder existence:", error);
    throw error;
  }
}

async function findHomeFolderId(userId) {
  try {
    const homeFolder = await prisma.folder.findFirst({
      where: {
        userId,
        parentId: null,
      },
    });

    return homeFolder.id;
  } catch (error) {
    console.error("Error finding home folder:", error);
    throw error;
  }
}

async function findFolderUserId(folderId) {
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },
      select: {
        userId: true,
      },
    });

    if (!folder) {
      throw new Error(`Folder with ID ${folderId} not found`);
    }

    return folder.userId;
  } catch (error) {
    console.error("Error finding userId for folder:", error);
    throw error;
  }
}

async function findDescendantFolders(folderId) {
  const descendants = [];

  async function findChildren(parentId) {
    const subfolders = await prisma.folder.findMany({
      where: { parentId },
    });

    for (const subfolder of subfolders) {
      descendants.push(subfolder.id);
      await findChildren(subfolder.id);
    }
  }

  await findChildren(folderId);
  return descendants;
}

async function findParentFolders(userId, folderId) {
  try {
    const descendants = await findDescendantFolders(folderId);
    descendants.push(folderId);

    const folders = await prisma.folder.findMany({
      where: {
        userId,
        id: { notIn: descendants },
      },
    });

    return folders;
  } catch (error) {
    console.error("Error fetching parent folders:", error);
    throw error;
  }
}

module.exports = {
  createUser,
  checkUsernameExists,
  findUser,
  createHomeFolder,
  findFolder,
  createFile,
  createFolder,
  checkFilenameExist,
  checkFoldernameExist,
  findHomeFolderId,
  findFolderUserId,
  findParentFolders,
};
